import Stripe from "stripe";
import { User } from "../models/user.models.js";
import { Order } from "../models/order.models.js";
import { Organization } from "../models/organization.models.js";
import { Plan } from "../models/plan.models.js";
import { Subscription } from "../models/subscription.models.js";

const YOUR_DOMAIN = "http://localhost:3000";

const createCheckoutSessionSubscription = async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  try {
    const organizationId = req.user.organization;
    // console.log(organizationId.toString());
    // console.log(req.body.priceId);

    const organization = await Organization.findById(organizationId);

    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }

    // Create or retrieve Stripe Customer
    let customer = organization.stripeCustomerId;
    if (!customer) {
      const stripeCustomer = await stripe.customers.create({
        email: organization.billingEmail,
      });
      customer = stripeCustomer.id;
      organization.stripeCustomerId = customer;
      await organization.save();
    }

    const subscriptionData = {
      mode: "subscription",
      payment_method_types: ["card"],
      customer: customer,
      billing_address_collection: "required",
      shipping_address_collection: {
        allowed_countries: ["IN"],
      },
      line_items: [{ price: req.body.priceId, quantity: 1 }],
      success_url: `${YOUR_DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${YOUR_DOMAIN}/cancel`,
      client_reference_id: organizationId.toString(),
      metadata: { planId: req.body.priceId.toString() },
      allow_promotion_codes: true,
      billing_cycle_anchor: 'now',
    };

    if (req.body.trialPeriodDays !== null) {
      subscriptionData.subscription_data = {
        trial_period_days: req.body.trialPeriodDays,
      };
    }

    const session = await stripe.checkout.sessions.create(subscriptionData);

    res.json({ sessionId: session.id });
  } catch (err) {
    console.error("Error creating checkout session:", err);
    res.status(500).json({ error: err.message });
  }
};

const createPortalSession = async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
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
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    const { cart } = await User.findById(userId).populate("cart.product");

    if (cart.length === 0) {
      return res.status(400).json({ error: "Cart is empty." });
    }

    let customer = user.stripeCustomerId;
    if (!customer) {
      const stripeCustomer = await stripe.customers.create({
        email: user.email,
      });
      customer = stripeCustomer.id;
      user.stripeCustomerId = customer;
      await user.save();
    }

    const lineItems = cart.map((item) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: item.product.name,
          images: [item.product.imageLink], // optional, add images if available
        },
        unit_amount: item.product.price * 100,
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      billing_address_collection: "required",
      shipping_address_collection: {
        allowed_countries: ["IN"],
      },
      success_url: `${YOUR_DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${YOUR_DOMAIN}/cancel`,
      customer: customer,
      metadata: { userId: userId.toString() },
    });

    // Create a pending order (you'll update this in the webhook)
    const newOrder = Order.create({
      products: cart,
      user: userId,
      orderStatus: "pending",
    });

    res.json({ sessionId: session.id, orderId: newOrder._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getCheckoutSession = async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const { sessionId } = req.params;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "customer"],
    });
    res.status(200).json(session);
  } catch (error) {
    console.error("Error retrieving checkout session:", error);
    res.status(500).json({ error: error.message });
  }
};

export {
  createCheckoutSessionSubscription,
  createPortalSession,
  createCheckoutSessionProducts,
  getCheckoutSession,
};
