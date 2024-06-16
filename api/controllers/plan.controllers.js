import { Plan } from "../models/plan.models.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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
  try {
    const { name, description, pricePerUserPerYear, userLimit } = req.body;

    if (
      [name, description, pricePerUserPerYear, userLimit].some(
        (field) => field.trim() === ""
      )
    ) {
      return res.status(400).json({ error: "Please fill all the fields" });
    }

    // Create a new product in Stripe
    const stripeProduct = await stripe.products.create({
      name,
      description,
    });

    // Create a new price in Stripe
    const stripePrice = await stripe.prices.create({
      unit_amount: pricePerUserPerYear * 100, // Amount in paise
      currency: "inr",
      recurring: { interval: "year" },
      product: stripeProduct.id,
    });

    // Create a new plan in your database
    const plan = new Plan({
      name,
      description,
      pricePerUserPerYear,
      userLimit,
      stripeProductId: stripeProduct.id, // Link to the Stripe product ID
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
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) return res.status(404).json({ error: "Plan not found" });

    const { name, description, pricePerUserPerYear, userLimit } = req.body;

    if (
      [name, description, pricePerUserPerYear, userLimit].some(
        (field) => field.trim() === ""
      )
    ) {
      return res.status(400).json({ error: "Please fill all the fields" });
    }

    // Update the product in Stripe
    await stripe.products.update(plan.stripeProductId, {
      name: name || plan.name,
      description: description || plan.description,
    });

    // Update plan details in your database
    plan.name = name || plan.name;
    plan.description = description || plan.description;
    plan.pricePerUserPerYear = pricePerUserPerYear || plan.pricePerUserPerYear;
    plan.userLimit = userLimit === undefined ? plan.userLimit : userLimit;

    await plan.save();
    res.json(plan);
  } catch (err) {
    console.error("Error updating plan:", err);
    res.status(500).json({ error: err.message });
  }
};

// delete a plan
const deletePlan = async (req, res) => {
    try {
        const plan = await Plan.findById(req.params.id);
        if (!plan) return res.status(404).json({ error: "Plan not found" });
    
        // Check if the plan is associated with any active subscriptions
        const activeSubscriptions = await Subscription.find({ plan: plan._id, status: "active" });
        if (activeSubscriptions.length > 0) {
          return res.status(400).json({ error: "Cannot delete plan with active subscriptions" });
        }
    
        // Delete the plan in Stripe (You may need to archive the product instead of deleting it to prevent issues with existing subscriptions)
        // await stripe.products.del(plan.stripeProductId);
    
        // Delete the plan from your database
        await Plan.findByIdAndDelete(req.params.id);
    
        res.json({ message: "Plan deleted" });
      } catch (err) {
        console.error("Error deleting plan:", err);
        res.status(500).json({ error: err.message });
      }
}

export { getAllPlans, createPlan, updatePlan, deletePlan };
