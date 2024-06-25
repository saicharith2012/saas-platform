import { Router } from "express";
import { verifyAuthorization, verifyJWT } from "../middleware/auth.middleware.js";
import { upgradeSubscription } from "../controllers/subscription.controllers.js";

const router = Router();

router.route("/upgrade-subscription").put(verifyJWT, verifyAuthorization("Admin"), upgradeSubscription)

export default router;
