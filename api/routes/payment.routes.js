import express from "express";
import {
  verifyAuthorization,
  verifyJWT,
} from "../middleware/auth.middleware.js";
import {
  createCheckoutSessionProducts,
  createCheckoutSessionSubscription,
  getCheckoutSession,
} from "../controllers/stripe.js";
import Stripe from "stripe";
import { Order } from "../models/order.models.js";
import { Plan } from "../models/plan.models.js";
import { Subscription } from "../models/subscription.models.js";
import { Organization } from "../models/organization.models.js";
import { User } from "../models/user.models.js";

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// for admin to subscribe to a plan
router
  .route("/create-checkout-session/subscription")
  .post(
    verifyJWT,
    verifyAuthorization("Admin"),
    createCheckoutSessionSubscription
  );

// for users to order products
router
  .route("/create-checkout-session/products")
  .post(verifyJWT, createCheckoutSessionProducts);

// stripe webhook endpoint
router
  .route("/webhook")
  .post(express.raw({ type: "application/json" }), async (req, res) => {
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
          const plan = await Plan.findOne({
            stripePriceId: session.metadata.planId,
          });

          if (!plan) {
            return res.status(404).json({ error: "Plan not found" });
          }

          // Update organization with the subscribed plan and stripe customer ID
          const organization = await Organization.findById(organizationId);
          if (!organization) {
            return res.status(404).json({ error: "Organization not found" });
          }

          organization.plan = plan._id;
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
              users: 0,
            });
            await newSubscription.save();
          } else {
            // Update the subscription if exists
            subscription.plan = plan._id;
            subscription.startDate = new Date();
            subscription.status = "active";
            subscription.stripeSubscriptionId = session.subscription;
            await subscription.save();
          }

          // console.log("Subscription created:", subscription); // Debugging
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

          const address = session.customer_details.address;
          console.log(address);

          // 2. Update order status and payment details
          order.orderStatus = "success";
          order.ShippingAddress = `${address.line1}, ${address.line2}, ${address.city}, ${address.state}, ${address.country}, ${address.postal_code}`;
          order.paymentId = paymentIntentId;
          await order.save({ validateBeforeSave: false });

          const user = await User.findById(userId);
          user.cart = [];
          await user.save({ validateBeforeSave: false });

          // ...
        } catch (err) {
          console.error("Error handling successful payment:", err);
        }
      }
    }

    // Handle successful subscription payment or update events

    if (event.type === "invoice.payment_succeeded") {
      const session = event.data.object;
      const customerId = session.customer;

      let retries = 3;
      const retryInterval = 2000; // 1 second

      const processInvoicePayment = async () => {
        try {
          const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
          const organization = await Organization.findOne({
            stripeCustomerId: customerId,
          });

          if (!organization && retries > 0) {
            retries--;
            console.log(`Retrying... attempts left: ${retries}`);
            setTimeout(processInvoicePayment, retryInterval);
            return;
          } else if (!organization) {
            return res.status(404).json({
              error: "Organization not found with the given customerId.",
            });
          }

          const subscription = await Subscription.findOne({
            organization: organization._id,
            status: "active",
          });

          if (!subscription) {
            return res.status(404).json({
              error: "Active subscription not found for this organization.",
            });
          }

          const invoice = await stripe.invoices.retrieve(session.id);
          console.log(invoice);

          if (invoice.lines.data[0]) {
            const invoicePeriodEnd = invoice.lines.data[0].period.end; // Assuming one line item in the invoice
            subscription.endDate = new Date(invoicePeriodEnd * 1000); // Convert to milliseconds
            await subscription.save();
          }
        } catch (err) {
          console.error("Error handling subscription renewal:", err);
        }
      };

      await processInvoicePayment();
    }

    if (event.type === "invoice.payment_failed") {
      const failedInvoice = event.data.object;
      try {
        const subscriptionId = failedInvoice.subscription;
        const subscription = await Subscription.findOne({
          stripeSubscriptionId: subscriptionId,
        });

        if (subscription) {
          await subscription.save();
          console.log(`Subscription ${subscriptionId} payment failed.`);
        }
      } catch (err) {
        console.error("Error handling invoice payment failed:", err);
      }
    }

    if (event.type === "invoice.created") {
      const createdInvoice = event.data.object;
      try {
        const subscriptionId = createdInvoice.subscription;
        const subscription = await Subscription.findOne({
          stripeSubscriptionId: subscriptionId,
        });

        if (subscription) {
          subscription.latestInvoiceId = createdInvoice.id;
          await subscription.save();
          console.log(
            `Invoice ${createdInvoice.id} created for subscription ${subscriptionId}.`
          );
        }
      } catch (err) {
        console.error("Error handling invoice creation:", err);
      }
    }

    if (event.type === "invoice.upcoming") {
      const invoice = event.data.object;

      // Check if the invoice is for a subscription and is upcoming
      if (
        invoice.subscription &&
        invoice.billing_reason === "subscription_create"
      ) {
        const subscriptionId = invoice.subscription;
        const subscription = await Subscription.findOne({
          stripeSubscriptionId: subscriptionId,
        });

        if (!subscription) {
          console.error(
            `Subscription with subscription ID ${subscriptionId} not found.`
          );
          return;
        }

        // Determine if the invoice is upcoming due to trial period end
        if (invoice.subscription_trial_end) {
          const trialEndTimestamp = invoice.subscription_trial_end;
          const currentTimestamp = Math.floor(Date.now() / 1000);

          if (trialEndTimestamp <= currentTimestamp) {
            // Trial period has ended, take appropriate actions (e.g., notify user or update status)
            console.log(
              `Trial period for subscription ${subscriptionId} has ended.`
            );

            // Example: Update organization status or notify admin/user
            subscription.status = "past_due";
            await subscription.save();

            const customer = invoice.customer;
            const organization = await Organization.findOne({
              stripeCustomerId: customer,
            });

            if (!organization) {
              res
                .status(404)
                .json({
                  error: "Organization not found with the given customerId.",
                });
            }

            organization.plan = null;
            await organization.save();
          }
        }
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
  });

// get stripe session
router.route("/checkout-session/:sessionId").get(getCheckoutSession);

export default router;
