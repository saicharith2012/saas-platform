import express from "express";
import {
  verifyAuthorization,
  verifyJWT,
} from "../middleware/auth.middleware.js";
import {
  createCheckoutSessionProducts,
  createCheckoutSessionSubscription,
  createPortalSession,
  webhookController,
} from "../controllers/stripe.js";

const router = express.Router();

// for admin to subscribe to a plan
router
  .route("/create-checkout-session/subscription")
  .post(
    verifyJWT,
    verifyAuthorization("Admin"),
    createCheckoutSessionSubscription
  );

// for managing stripe customer portal
router.route("/create-portal-session").post(verifyJWT, createPortalSession);

// for users to order products
router
  .route("/create-checkout-session/products")
  .post(verifyJWT, createCheckoutSessionProducts);

// stripe webhook endpoint
router
  .route("/webhook")
  .post(express.raw({ type: "application/json" }), webhookController);

export default router;
