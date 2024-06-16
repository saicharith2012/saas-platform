import {Router} from "express";
import { verifyJWT, verifyAuthorization } from "../middleware/auth.middleware.js";
import { createOrganization, getAllOrganizations } from "../controllers/organization.controllers.js";

const router = Router()

// create organizations - super admin privilege
router.post("/create-organization", verifyJWT, verifyAuthorization("Super Admin"), createOrganization)

// get all organisation - super admin privilege
router.get("/get-all-organizations", verifyJWT, verifyAuthorization("Super Admin"), getAllOrganizations)

export default router;