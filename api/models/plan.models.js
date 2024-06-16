import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    name: { type: String, enum: ["Basic", "Standard", "Plus"], required: true },
    description: { type: String, required: true },
    pricePerUserPerYear: { type: Number, required: true },
    userLimit: { type: Number },
    stripeProductId: { type: String},
  },
  { timestamps: true }
);

export const Plan = mongoose.model("Plan", planSchema);
