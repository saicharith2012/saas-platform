import { Router } from "express";
import { getAllPlans } from "../controllers/plan.controllers.js";
import {
  verifyJWT,
  verifyAuthorization,
} from "../middleware/auth.middleware.js";

const router = Router();

router.route("/").get(verifyJWT, verifyAuthorization("Super Admin"), getAllPlans);

export default router;
