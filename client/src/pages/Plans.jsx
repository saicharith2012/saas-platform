import React, { useEffect, useState } from "react";
import axios from "axios"; // Make sure you have Axios installed

function Plans() {
  const [plans, setPlans] = useState([]); // To store the fetched plans
    const organizationId = "666e69565f144579118df892"// Assuming you store the org ID

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/plans/");
        console.log(response.data)
        setPlans(response.data);
      } catch (error) {
        console.error("Error fetching plans:", error);
      }
    };

    fetchPlans();
  }, []);

  const handleCheckout = async (plan) => {
    console.log("redirect to stripe checkout");
    // try {
    //   const response = await axios.post("/api/create-checkout-session", {
    //     priceId: plan.stripeProductId,
    //     organizationId,
    //   });

    //   const stripe = Stripe("YOUR_STRIPE_PUBLISHABLE_KEY");
    //   await stripe.redirectToCheckout({ sessionId: response.data.sessionId });
    // } catch (error) {
    //   console.error("Error initiating checkout:", error);
    //   // Handle the error, e.g., display an error message to the user
    // }
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
              <p>User limit: {plan.userLimit === null ? "above 10 users" : plan.userLimit  - 1}</p>
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
