import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["active", "cancelled", "trialing", "past_due", "trial_expired"],
      required: true,
    },
    stripeSubscriptionId: { type: String },
    users: {
      type: Number,
      default: 0,
    },
    latestInvoiceId: {
      type: String,
    }
  },
  { timestamps: true }
);

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
