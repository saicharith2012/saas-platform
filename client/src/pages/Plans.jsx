import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { loadStripe } from "@stripe/stripe-js";
import { Navigate } from "react-router-dom";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

function Plans() {
  const [plans, setPlans] = useState([]);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/plans/", {
          withCredentials: true,
        });
        setPlans(response.data);
      } catch (error) {
        console.error("Error fetching plans:", error);
      }
    };

    fetchPlans();
  }, []);

  const handleCheckout = async (plan) => {
    if (!user) {
      alert("Please log in to proceed with the subscription.");
      Navigate("/login");
      return;
    }
    const stripe = await stripePromise;
    try {
      const response = await axios.post(
        "http://localhost:5000/api/payments/create-checkout-session/subscription",
        { priceId: plan.stripeProductId },
        { withCredentials: true }
      );
      const { sessionId } = response.data;
      stripe.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error("Error creating checkout session:", error);
    }
  };

  return (
    <div className="plans">
      <h2>Choose Your Plan</h2>
      <div className="plans-container">
        {plans.map((plan) => (
          <div key={plan._id}>
            <div className="plan-card">
              <h3>{plan.name}</h3>
              <p>{plan.description}</p>
              <p>
                User limit:{" "}
                {plan.userLimit === null
                  ? "above 10 users"
                  : plan.userLimit - 1}
              </p>
              <p>₹{plan.pricePerUserPerYear} per user per year</p>
              <button onClick={() => handleCheckout(plan)}>Subscribe</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Plans;
