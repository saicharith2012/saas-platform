import React, { useState } from "react";
import axios from "axios";

function CreatePlanForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [pricePerUserPerYear, setPricePerUserPerYear] = useState("");
  const [userLimit, setUserLimit] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:5000/api/plans/create-plan",
        {
          name,
          description,
          pricePerUserPerYear,
          userLimit,
        },
        { withCredentials: true }
      );

      console.log("New plan created:", response.data);
      setName("");
      setDescription("");
      setPricePerUserPerYear("");
      setUserLimit("");
      // Optionally handle success (e.g., show a success message, redirect, etc.)
    } catch (error) {
      console.error("Error creating plan:", error);
      // Optionally handle error (e.g., show an error message)
    }
  };

  return (
    <div>
      <h2>Create New Plan</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Description:</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Price Per User Per Year:</label>
          <input
            type="number"
            value={pricePerUserPerYear}
            onChange={(e) => setPricePerUserPerYear(e.target.value)}
            required
          />
        </div>
        <div>
          <label>User Limit:</label>
          <input
            type="number"
            value={userLimit}
            onChange={(e) => setUserLimit(e.target.value)}
          />
        </div>
        <button type="submit">Create Plan</button>
      </form>
    </div>
  );
}

export default CreatePlanForm;
