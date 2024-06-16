import { Router } from "express";
import {
  createPlan,
  deletePlan,
  getAllPlans,
  updatePlan,
} from "../controllers/plan.controllers.js";
import {
  verifyJWT,
  verifyAuthorization,
} from "../middleware/auth.middleware.js";

const router = Router();

// get all plans
router
  .route("/")
  .get(verifyJWT, verifyAuthorization("Super Admin", "Admin"), getAllPlans);

// create new plan - super admin privilege
router
  .route("/create-plan")
  .post(verifyJWT, verifyAuthorization("Super Admin"), createPlan);

// update an existing plan - super admin privilege
router
  .route("/update-plan/:id")
  .put(verifyJWT, verifyAuthorization("Super Admin"), updatePlan);

// delete an existing plan - super admin privilege
router
  .route("/delete-plan/:id")
  .delete(verifyJWT, verifyAuthorization("Super Admin"), deletePlan);

export default router;
