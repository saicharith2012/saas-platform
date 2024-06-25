import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    pricePerUserPerYear: { type: Number, required: true },
    userLimit: { type: Number, default: null },
    stripeProductId: { type: String},
    stripePriceId: { type: String},
    trialPeriodDays: { type: Number, default: null },
  },
  { timestamps: true }
);

export const Plan = mongoose.model("Plan", planSchema);
