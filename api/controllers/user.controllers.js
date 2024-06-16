import { User } from "../models/user.models.js";
import { Organization } from "../models/organization.models.js";
import validator from "validator";

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
  try {
    const { email, name, customPassword } = req.body;

    const organization = await Organization.findById(req.user.organization).populate("plan");
    if (!organization) {
      return res.status(404).json({ error: "Organization not found." });
    }

    console.log(organization)

    if (organization.plan.userLimit !== null) {
      const existingUsers = await User.countDocuments({
        organization: req.user.organization,
      });
      if (existingUsers >= organization.plan.userLimit) {
        return res
          .status(400)
          .json({ error: "User limit for the plan has been reached." });
      }
    }

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

    return res
      .status(201)
      .json({ message: "User registered successfully", user: createdUser });
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

export {
  registerSuperAdmin,
  adminRegistration,
  userRegistration,
  loginUser,
  logoutUser,
  changePassword,
};
