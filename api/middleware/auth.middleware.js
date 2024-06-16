import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";

// middleware to verify the jwt token and add the user to the request object.
const verifyJWT = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization").replace("Bearer ", "");
    if (!token) {
      return res.status(401).send({ error: "Unauthorized Request." });
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken._id).select(
      "-password -refreshToken"
    );
    if (!user) {
      return res.status(401).send({ error: "Invalid Access Token." });
    }

    req.user = user;

    next();
  } catch (err) {
    res
      .status(403)
      .send({ error: err?.message, message: "Please Authenticate." });
  }
};

// middleware to verify token and authorize specific roles.
const verifyAuthorization = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).send({ error: "Unauthorized Request." });
    }

    next();
  };
};

export { verifyJWT, verifyAuthorization };
