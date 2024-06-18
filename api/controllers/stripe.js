import Stripe from "stripe";
import { User } from "../models/user.models.js";
import { Order } from "../models/order.models.js";
import { Organization } from "../models/organization.models.js";
import { Plan } from "../models/plan.models.js";
import { Subscription } from "../models/subscription.models.js";

const YOUR_DOMAIN = "http://localhost:3001";

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
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    const { cart } = await User.findById(userId).populate("cart.product");

    if (cart.length === 0) {
      return res.status(400).json({ error: "Cart is empty." });
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
      success_url: `${YOUR_DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${YOUR_DOMAIN}/cancel`,
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


export {
  createCheckoutSessionSubscription,
  createPortalSession,
  createCheckoutSessionProducts,
};
