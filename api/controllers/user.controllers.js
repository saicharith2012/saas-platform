import { User } from "../models/user.models.js";
import { Product } from "../models/product.models.js";
import { Organization } from "../models/organization.models.js";
import validator from "validator";
import { Order } from "../models/order.models.js";
import { Subscription } from "../models/subscription.models.js";
import Stripe from "stripe";

// method to generate access and refresh tokens
const generateAccessandRefreshToken = async function (userId) {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // save the refresh token in the database without any validation
    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh tokens."
    );
  }
};

// register super admin
const registerSuperAdmin = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if ([email, name, password].some((field) => field.trim() === "")) {
      return res.status(400).json({ error: "Please fill all the fields" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: "Please enter a valid email" });
    }

    // checking if super admin already exists
    const existingSuperAdmin = await User.findOne({ role: "Super Admin" });
    if (existingSuperAdmin) {
      return res.status(400).json({ error: "Super Admin already exists" });
    }

    // check if the user already exists
    const existedUser = await User.findOne({
      $or: [{ email }, { name }],
    });

    if (existedUser) {
      return res.status(400).json({ error: "Super Admin already exists" });
    }

    const user = await User.create({
      email,
      password,
      name,
      role: "Super Admin",
    });

    const createdUser = await User.findById(user._id).select("-password");

    if (!createdUser) {
      return res
        .status(500)
        .json({ error: "Something went wrong while creating the user" });
    }

    return res
      .status(201)
      .json({ user: createdUser, message: "Super Admin created successfully" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: "Something went wrong while creating the super Admin" });
  }
};

// admin registration by super admin
const adminRegistration = async (req, res) => {
  try {
    const { email, password, name, organizationId } = req.body;

    if (
      [email, name, password, organizationId].some(
        (field) => field.trim() === ""
      )
    ) {
      return res.status(400).json({ error: "Please fill all the fields" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: "Please enter a valid email" });
    }

    const organization = await Organization.findById(organizationId);

    if (!organization) {
      return res.status(404).json({ error: "Organization not found." });
    }

    const admin = await User.create({
      email,
      password,
      name,
      role: "Admin",
      organization: organizationId,
    });

    organization.admin = admin._id;
    await organization.save({ validateBeforeSave: false });

    const createdUser = await User.findById(admin._id).select("-password");

    if (!createdUser) {
      return res
        .status(500)
        .json({ error: "Something went wrong while creating the user" });
    }

    return res
      .status(201)
      .json({ message: "Admin registered successfully", user: createdUser });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// user registration by admin
const userRegistration = async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  try {
    const { email, name, customPassword } = req.body;

    const organization = await Organization.findById(
      req.user.organization
    ).populate("plan");

    if (!organization) {
      return res.status(404).json({ error: "Organization not found." });
    }

    if (!organization.plan) {
      return res.status(404).json({ error: "Not subscribed to any plan." });
    }

    if (organization.plan.userLimit !== null) {
      const existingUsers = await User.countDocuments({
        organization: req.user.organization,
      });
      if (existingUsers >= organization.plan.userLimit) {
        return res
          .status(400)
          .json({ error: "User limit for the plan has been reached. You may upgrade your plan." });
      }
    }

    const subscription = await Subscription.findOne({
      organization: req.user.organization,
    });

    if (!subscription) {
      return res.status(404).json({ error: "Not subscribed to any plan." });
    }

    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.stripeSubscriptionId
    );

    let users = subscription.users;

    // if there is already one or more users additional charge.
    if (users >= 1) {
      console.log(stripeSubscription)
      await stripe.subscriptions.update(
        stripeSubscription.id,
        {
          items: [
            {
              id: stripeSubscription.items.data[0].id,
              quantity: users + 1,
            },
          ],
          proration_behavior: "create_prorations",
        }
      );

      // Create and finalize an invoice
      const invoice = await stripe.invoices.create({
        customer: stripeSubscription.customer,
        subscription: stripeSubscription.id,
        collection_method: 'charge_automatically',
        auto_advance: true,
      });

      if(!invoice) {
        return res.status(404).json({error: "invoice is not defined." })
      }


      await stripe.invoices.finalizeInvoice(invoice.id);
    }


    subscription.users = users + 1;
    await subscription.save({ validateBeforeSave: false });

    const user = await User.create({
      email,
      password: customPassword,
      name,
      role: "User",
      organization: req.user.organization,
    });

    const createdUser = await User.findById(user._id).select("-password");

    if (!createdUser) {
      return res
        .status(500)
        .json({ error: "Something went wrong while creating the user" });
    }

    const orgUsers = await User.find({ organization: req.user.organization });

    return res
      .status(201)
      .json({ message: "User registered successfully", orgUsers });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// user login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if ([email, password].some((field) => field.trim() === "")) {
      return res.status(400).json({ error: "Please fill all the fields" });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: "Please enter a valid email" });
    }
    const user = await User.findOne({ email }).populate("organization");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ error: "Password is incorrect" });
    }

    // create access and refresh tokens
    const { accessToken, refreshToken } = await generateAccessandRefreshToken(
      user._id
    );

    // send access and refresh tokens in the form of cookies
    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    // send response
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        user: loggedInUser,
        accessToken,
        refreshToken,
        message: "User logged in successfully",
      });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// logout user
const logoutUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          accessToken: undefined,
          refreshToken: undefined,
        },
      },
      {
        new: true,
      }
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json({ message: "User logged out successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// change password
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id);

    if (!user) {
      return res.status(400).json({ error: "Unauthorized Request" });
    }

    if (!(await user.isPasswordCorrect(oldPassword))) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// add product to cart
const addProductToCart = async (req, res) => {
  try {
    const userId = req.params.userId;
    const productId = req.body.productId;
    const quantity = req.body.quantity || 1;

    // checking if the user is authorized to modify this cart
    if (req.user.role !== "Admin" && req.user._id.toString() !== userId) {
      return res.status(403).json({ error: "Not authorized." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json();
    }

    // checking if item is already in the cart
    const cartItemIndex = user.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (cartItemIndex !== -1) {
      // product exists in the cart
      user.cart[cartItemIndex].quantity += quantity;
    } else {
      // product doesnt exist in the cart, add a new item
      user.cart.push({ product: productId, quantity });
    }

    await user.save({ validateBeforeSave: false });

    res.status(200).json({ message: "Product added to cart", cart: user.cart });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// get user cart
const getUserCart = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Check if the user is authorized to view this cart
    if (req.user.role !== "Admin" && req.user._id.toString() !== userId) {
      return res.status(403).json({ error: "Not authorized." });
    }

    const user = await User.findById(userId).populate("cart.product");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user.cart);
  } catch (err) {
    console.error("Error fetching cart:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// get user's order history
const getOrderHistory = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Check authorization (admin can see all user's history, users only their own)
    if (req.user.role !== "Admin" && !req.user._id.equals(userId)) {
      return res.status(403).json({ error: "Not authorized." });
    }

    const orders = await Order.find({ user: userId })
      .populate("products.product")
      .populate({
        path: "user",
        populate: { path: "organization", populate: { path: "plan" } },
      }); // Populate plan details

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export {
  registerSuperAdmin,
  adminRegistration,
  userRegistration,
  loginUser,
  logoutUser,
  changePassword,
  addProductToCart,
  getUserCart,
  getOrderHistory,
};
