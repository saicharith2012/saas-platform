import { Router } from "express";
import {
  verifyJWT,
  verifyAuthorization,
} from "../middleware/auth.middleware.js";
import {
  createOrganization,
  getAllOrganizations,
  getOrganizationUsers,
} from "../controllers/organization.controllers.js";

const router = Router();

// create organizations - super admin privilege
router
  .route("/create-organization")
  .post(verifyJWT, verifyAuthorization("Super Admin"), createOrganization);

// get all organisation - super admin privilege
router
  .route("/get-all-organizations")
  .get(verifyJWT, verifyAuthorization("Super Admin"), getAllOrganizations);

// get organization routes
router
  .route("/:id/user-count")
  .get(verifyJWT, verifyAuthorization("Super Admin"), getOrganizationUsers);

export default router;
