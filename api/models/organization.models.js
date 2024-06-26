import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
    },
    stripeCustomerId: {
      type: String,
    },
    billingEmail: {
      type: String,
    },
    admin : {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }
  },
  { timestamps: true }
);

export const Organization = mongoose.model("Organization", organizationSchema);
