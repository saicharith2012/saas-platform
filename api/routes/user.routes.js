import { Router } from "express";
import {
  // registerSuperAdmin,
  adminRegistration,
  userRegistration,
  loginUser,
  logoutUser,
  changePassword,
  addProductToCart,
  getUserCart,
} from "../controllers/user.controllers.js";
import {
  verifyJWT,
  verifyAuthorization,
} from "../middleware/auth.middleware.js";

const router = Router();

// super admin - signup
// router
//   .route("/sa-signup")
//   .post(verifyJWT, verifyAuthorization("Super Admin"), registerSuperAdmin);

// admin - signup -> super admin privilege
router
  .route("/admin-signup")
  .post(verifyJWT, verifyAuthorization("Super Admin"), adminRegistration);

// user - signup -> admin privilege
router
  .route("/user-signup")
  .post(verifyJWT, verifyAuthorization("Admin"), userRegistration);

// any user login -> user privilege
router.route("/login").post(loginUser);

// log out -> user privilege
router.route("/logout").post(verifyJWT, logoutUser);

// change password -> user privilege
router.route("/change-password").put(verifyJWT, changePassword);

// add product to cart -> user privilege
router.route("/:userId/cart").post(verifyJWT, addProductToCart)

// get user's cart -> user privilege
router.route("/users/:userId/cart").get(verifyJWT, getUserCart)

export default router;
