import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    imageLink: {
      String,
    },
    stripePriceId: {
      String,
    }
  },
  { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);
