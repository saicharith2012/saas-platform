import { Plan } from "../models/plan.models.js";
import Stripe from "stripe";
import { Subscription } from "../models/subscription.models.js";

// get all plans
const getAllPlans = async (req, res) => {
  try {
    const plans = await Plan.find({});
    res.status(200).json(plans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// create a plan
const createPlan = async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  try {
    const { name, description, pricePerUserPerYear, userLimit } = req.body;

    if (!name || !description || !pricePerUserPerYear || !userLimit) {
      return res.status(400).json({ error: "Please fill all the fields" });
    }

    // Create a new product in Stripe
    const stripeProduct = await stripe.products.create({
      name,
      description,
      type: "service",
    });

    // Create a new price in Stripe
    const stripePrice = await stripe.prices.create({
      unit_amount: pricePerUserPerYear * 100, // Amount in paise
      currency: "inr",
      recurring: { interval: "year", usage_type: "metered" },
      product: stripeProduct.id,
    });

    // console.log(stripePrice);

    // Create a new plan in your database
    const plan = new Plan({
      name,
      description,
      pricePerUserPerYear,
      userLimit,
      stripeProductId: stripeProduct.id,
      stripePriceId: stripePrice.id,
    });

    await plan.save();
    res.status(201).json(plan);
  } catch (err) {
    console.error("Error creating plan:", err);
    res.status(500).json({ error: err.message });
  }
};

// update a plan
const updatePlan = async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const { name, description, pricePerUserPerYear, userLimit } = req.body;

    if (!name || !description || !pricePerUserPerYear || !userLimit) {
      return res.status(400).json({ error: "Please fill all the fields" });
    }

    const plan = await Plan.findById(req.params.id);
    if (!plan) return res.status(404).json({ error: "Plan not found" });

    // create a new product and price in Stripe
    const product = await stripe.products.create({
      name,
      description,
    });

    const price = await stripe.prices.create({
      unit_amount: pricePerUserPerYear * 100, // Amount in paise
      currency: "inr",
      recurring: { interval: "year" },
      product: product.id,
    });

    // Update plan details in your database
    plan.name = name || plan.name;
    plan.description = description || plan.description;
    plan.pricePerUserPerYear = pricePerUserPerYear || plan.pricePerUserPerYear;
    plan.userLimit = userLimit === undefined ? plan.userLimit : userLimit;
    plan.stripeProductId = product.id;
    plan.stripePriceId = price.id;

    await plan.save();
    res.json(plan);
  } catch (err) {
    console.error("Error updating plan:", err);
    res.status(500).json({ error: err.message });
  }
};

// delete a plan
const deletePlan = async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) return res.status(404).json({ error: "Plan not found" });
    // Check if the plan is associated with any active subscriptions
    const activeSubscriptions = await Subscription.find({
      plan: plan._id,
      status: "active",
    });

    // Archive the plan in Stripe instead of deleting it
    //  to prevent issues with existing subscriptions
    await stripe.products.update(plan.stripeProductId, { active: false });

    await Plan.findByIdAndDelete(req.params.id);

    return res
      .status(200)
      .json({ message: "Plan archived and deleted from the database" });
  } catch (err) {
    console.error("Error deleting plan:", err);
    res.status(500).json({ error: err.message });
  }
};

export { getAllPlans, createPlan, updatePlan, deletePlan };
