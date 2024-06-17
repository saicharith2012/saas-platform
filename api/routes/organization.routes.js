import { Router } from "express";
import {
  verifyJWT,
  verifyAuthorization,
} from "../middleware/auth.middleware.js";
import {
  createOrganization,
  getAllOrganizations,
  getOrganizationData,
  getOrganizationUsers,
  getOrganizationUsersData,
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

// get organization user count
router
  .route("/:id/user-count")
  .get(verifyJWT, verifyAuthorization("Super Admin"), getOrganizationUsers);

// get organization data - admin privilege
router.route("/:id").get(verifyJWT, verifyAuthorization("Admin"), getOrganizationData)

// get organization users data - admin privilege
router.route("/:id/users").get(verifyJWT, verifyAuthorization("Admin"), getOrganizationUsersData)

export default router;
