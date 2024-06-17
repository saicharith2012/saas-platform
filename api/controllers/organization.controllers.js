import { Organization } from "../models/organization.models.js";
import validator from "validator";
import { Plan } from "../models/plan.models.js";
import { User } from "../models/user.models.js";

// create organization
const createOrganization = async (req, res) => {
  try {
    const { name, billingEmail } = req.body;

    if ([name, billingEmail].some((field) => field.trim() === "")) {
      return res.status(400).json({ error: "Please fill all the fields" });
    }

    if (!validator.isEmail(billingEmail)) {
      return res.status(400).json({ error: "Please enter a valid email" });
    }

    // const defaultPlan = await Plan.findOne({name : "Basic"})

    // if (!defaultPlan) {
    //   return res.status(404).json({ error: "Plan not found." });
    // }

    const organization = await Organization.create({
      name,
      billingEmail,
      // plan: defaultPlan._id,
    });

    if (!organization) {
      return res.status(400).json({
        error: "Organization could not be created",
      });
    }

    return res.status(201).json({
      message: "Organization created successfully",
      organization,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// get all organistions
const getAllOrganizations = async (req, res) => {
  try {
    const organizations = await Organization.find().populate("plan");
    return res.json({
      organizations,
      message: "Organizations fetched successfully",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// get users from an organization
const getOrganizationUsers = async (req, res) => {
  try {
    const organizationId = req.params.id;

    const userCount = await User.countDocuments({
      organization: organizationId,
    });

    res.json({ userCount });
  } catch (err) {
    res
      .status(500)
      .json({ error: err.message, message: "could not fetch no.of users" });
  }
};

export { createOrganization, getAllOrganizations, getOrganizationUsers };
