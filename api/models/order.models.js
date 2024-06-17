import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
        },
      },
    ],
    orderStatus: {
      type: String,
      enum: ["failed", "success", "pending"],
      default: "failed",
    },
    paymentId: {
      type: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number
    },
    currency: {
      type: String
    }
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);
