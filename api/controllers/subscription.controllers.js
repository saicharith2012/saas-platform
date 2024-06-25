import { Organization } from "../models/organization.models.js";
import { Subscription } from "../models/subscription.models.js";
import Stripe from "stripe";


const upgradeSubscription = async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const { newPriceId, newPlanId } = req.body;
    const { organizationId } = req.user;

    const organization = await Organization.findById(organizationId).populate(
      "plan"
    );

    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }

    const subscription = await Subscription.findOne({
      organization: organizationId,
    });

    if (!subscription) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.stripeSubscriptionId
    );

    const updatedSubscription = await stripe.subscriptions.update(
      stripeSubscription.id,
      {
        items: [
          {
            id: stripeSubscription.items.data[0].id,
            price: newPriceId,
          },
        ],
        proration_behavior: "create_prorations",
      }
    );

    subscription.plan = newPlanId;
    await subscription.save();

    return res
      .status(200)
      .json({
        message: "subscription upgraded successfully",
        updatedSubscription,
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export { upgradeSubscription };
