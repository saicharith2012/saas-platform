// client/src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
// import { useNavigate } from 'react-router-dom';
import Navbar from "../components/Navbar";

function AdminDashboard() {
  const [organization, setOrganization] = useState(null);
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("")
  //   const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  //   console.log(user)

  useEffect(() => {
    // Fetch organization details and users based on logged-in admin's organization ID
    const fetchOrganizationAndUsers = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/organizations/${user.organization}`,
          {
            withCredentials: true,
          }
        );
        // console.log(response)
        setOrganization(response.data.organization);
      } catch (error) {
        console.error("Error fetching organization:", error);
        setError("Error fetching organization")
      }

      try {
        const response = await axios.get(
          `http://localhost:5000/api/organizations/${user.organization}/users`,
          {
            withCredentials: true,
          }
        );
        setUsers(response.data.users);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Error fetching users")
      }
    };

    if (user && user.role === "Admin") {
      fetchOrganizationAndUsers();
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `http://localhost:5000/api/users/user-signup`,
        {
          name: newUser.name,
          email: newUser.email,
          customPassword: newUser.password,
        },
        {
          withCredentials: true,
        }
      );

      if (response.data.error) {
        console.log(response.data.error);
        setError(response.data.error) 
      }
      setUsers(response.data.orgUsers);
      setNewUser({
        name: "",
        email: "",
        password: "",
      });
    } catch (error) {
      console.error("Error creating user:", error);
      setError(error.response.data.error)
    }
  };

  return (
    <div>
      <Navbar />
      <h1>Admin Dashboard</h1>

      {organization ? (
        <div>
          <h2>{organization.name}</h2>
          {organization.plan ? (
            <div>
              <h3>Subscribed Plan</h3>
              <p>{organization.plan.name}</p>
              <p>{organization.plan.description}</p>
              <p>User Limit: {organization.plan.userLimit === null ? "NA" : organization.plan.userLimit - 1}</p>
            </div>
          ) : (
            <div>
              <p>No plan subscribed</p>
            </div>
          )}

          <h3>Manage Users</h3>
          <form onSubmit={handleSubmit}>
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={newUser.name}
              onChange={handleChange}
              required
            />
            <br />
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={newUser.email}
              onChange={handleChange}
              required
            />
            <br />
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={newUser.password}
              onChange={handleChange}
              required
            />
            <br />
            <button type="submit">Create User</button>
          </form>

          <h3>Current Users</h3>
          <ul>
            {users.map((user) => (
              <li key={user._id}>
                <p>Name: {user.name}</p>
                <p>Email: {user.email}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>Loading...</p>
      )}

      <p>
        <a href="/plans">Browse Plans</a>
      </p>
      <p>{error}</p>
    </div>
  );
}

export default AdminDashboard;
