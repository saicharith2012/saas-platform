import Stripe from "stripe";
import { User } from "../models/user.models.js";
import { Order } from "../models/order.models.js";
import { Organization } from "../models/organization.models.js";
import { Plan } from "../models/plan.models.js";
import { Subscription } from "../models/subscription.models.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const YOUR_DOMAIN = process.env.FRONTEND_ORIGIN;

const createCheckoutSessionSubscription = async (req, res) => {
  try {
    const organizationId = req.user.organization;
    const { priceId } = req.body;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${YOUR_DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${YOUR_DOMAIN}/cancel`,
      client_reference_id: organizationId,
    });

    res.json({ sessionId: session.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createPortalSession = async (req, res) => {
  try {
    const organization = await Organization.findById(req.user.organization);
    if (!organization || !organization.stripeCustomerId) {
      return res
        .status(400)
        .json({ error: "No active subscription found for this organization." });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: organization.stripeCustomerId,
      return_url: `${YOUR_DOMAIN}/subscription-management`,
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createCheckoutSessionProducts = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    const { cart } = await User.findById(userId).populate("cart.product");

    if (cart.length === 0) {
      return res.status(400).json({ error: "Cart is empty." });
    }

    const lineItems = cart.map((item) => ({
      price: item.product.stripePriceId,
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      success_url: `${YOUR_DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${YOUR_DOMAIN}/cancel`,
      metadata: { userId: userId },
    });

    // Create a pending order (you'll update this in the webhook)
    const newOrder = Order.create({
      products: cart,
      user: userId,
      orderStatus: "pending",
    });

    // Clear cart after successful checkout
    user.cart = [];
    await user.save({ validateBeforeSave: false });

    res.json({ sessionId: session.id, orderId: newOrder._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const webhookController = async (req, res) => {
  const sig = req.headers["stripe-signature"]; // Get Stripe signature from headers
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    if (session.mode === "subscription") {
      const organizationId = session.client_reference_id;

      try {
        // Update organization with the subscribed plan and stripe customer ID
        const organization = await Organization.findById(organizationId);
        if (!organization) {
          return res.status(404).json({ error: "Organization not found" });
        }
        const plan = await Plan.findOne({
          stripeProductId: session.line_items.data[0].price.product,
        });
        organization.plan = plan._id;
        organization.stripeCustomerId = session.customer;
        await organization.save();

        // Create or update the subscription in the database
        const subscription = await Subscription.findOne({
          organization: organizationId,
        });

        if (!subscription) {
          // Create a new subscription entry in your database
          const newSubscription = new Subscription({
            organization: organizationId,
            plan: plan._id,
            startDate: new Date(),
            status: "active",
            stripeSubscriptionId: session.subscription,
          });
          await newSubscription.save();
        } else {
          // Update the subscription if exists
          subscription.plan = planId;
          subscription.startDate = new Date();
          subscription.status = "active";
          subscription.stripeSubscriptionId = session.subscription;
          await subscription.save();
        }

        console.log("Subscription created:", subscription); // Debugging
      } catch (err) {
        console.error("Error handling subscription activation:", err);
      }
    } else if (session.mode === "payment") {
      const userId = session.metadata.userId;
      const paymentIntentId = session.payment_intent; // Get the payment intent ID

      try {
        // 1. Retrieve the pending order
        const order = await Order.findOne({
          user: userId,
          orderStatus: "pending",
        });
        if (!order) {
          return res.status(404).json({ error: "Pending order not found." });
        }

        // 2. Update order status and payment details
        order.orderStatus = "success";
        order.paymentId = paymentIntentId;
        await order.save();

        // Additional logic for order fulfillment (e.g., sending confirmation email)
        // ...
      } catch (err) {
        console.error("Error handling successful payment:", err);
        // Consider retrying or notifying the user/admin of the issue
      }
    }
  }

  // Handle successful subscription payment or update events
  if (event.type === "invoice.payment_succeeded") {
    const session = event.data.object;
    const customerId = session.customer; // Stripe customer ID

    try {
      // 1. Find the organization associated with the customer
      const organization = await Organization.findOne({
        stripeCustomerId: customerId,
      });

      // 2. Retrieve the subscription for this organization
      const subscription = await Subscription.findOne({
        organization: organization._id,
        status: "active",
      });

      if (!subscription) {
        return res.status(404).json({
          error: "Active subscription not found for this organization.",
        });
      }

      // 3. Update the subscription end date based on the invoice period
      const invoice = await stripe.invoices.retrieve(session.id);
      const invoicePeriodEnd = invoice.lines.data[0].period.end; // Assuming one line item in the invoice
      subscription.endDate = new Date(invoicePeriodEnd * 1000); // Convert to milliseconds
      await subscription.save();
    } catch (err) {
      console.error("Error handling subscription renewal:", err);
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const session = event.data.object;
    const subscriptionId = session.id;

    //Update the subscription status in mongo db
    await Subscription.findOneAndUpdate(
      { stripeSubscriptionId: subscriptionId },
      { status: "cancelled" }
    );
  }

  res.status(200).json({ received: true });
};

export {
  createCheckoutSessionSubscription,
  createPortalSession,
  createCheckoutSessionProducts,
  webhookController,
};
