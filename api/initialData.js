import { Plan } from "./models/plan.models.js";

const plansData = [
  {
    name: "Basic",
    description: "Limited features for individual users.",
    pricePerUserPerYear: 0, // Free
    userLimit: 1,
    stripeProductId: "",
  },
  {
    name: "Standard",
    description: "Enhanced features for small teams.",
    pricePerUserPerYear: 4999,
    userLimit: 5,
    stripeProductId: "",
  },
  {
    name: "Plus",
    description: "Premium features for large teams and enterprises.",
    pricePerUserPerYear: 3999,
    userLimit: null, // Unlimited above 10 users
    stripeProductId: "",
  },
];



export const addInitialData = async () => {
  try {
    await Plan.deleteMany({});
    await Plan.insertMany(plansData);
    console.log("Initial plans data added to database.");
    process.exit(0);
  } catch (err) {
    console.error("Error adding initial plans data to database: ", err);
    process.exit(1);
  }
};
