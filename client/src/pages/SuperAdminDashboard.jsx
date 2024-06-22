import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function SuperAdminDashboard() {
  const [organizations, setOrganizations] = useState([]);
  const [userCounts, setUserCounts] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [orgName, setOrgName] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [adminName, setAdminName] = useState(""); // New state for admin name
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Check if user is super admin
    if (user && user.role !== "Super Admin") {
      navigate("/"); // Redirect to home or login page
    } else {
      const fetchOrganizations = async () => {
        try {
          const response = await axios.get(
            "http://localhost:5000/api/organizations/get-all-organizations",
            {
              withCredentials: true,
            }
          );
          setOrganizations(response.data.organizations); // Set organizations state
          return response.data.organizations; // Return organizations for further processing
        } catch (error) {
          console.error("Error fetching organizations:", error);
          throw error; // Propagate the error to handle it further
        }
      };

      // Fetch user count for each organization
      const fetchUserCounts = async (organizations) => {
        try {
          const counts = {};
          await Promise.all(
            organizations.map(async (org) => {
              const response = await axios.get(
                `http://localhost:5000/api/organizations/${org._id}/user-count`,
                {
                  withCredentials: true,
                }
              );
              counts[org._id] = response.data.userCount;
            })
          );
          setUserCounts(counts); // Set userCounts state
          setIsLoading(false); // Set loading to false after fetching user counts
        } catch (error) {
          console.error("Error fetching user counts:", error);
        }
      };

      fetchOrganizations()
        .then(fetchUserCounts)
        .catch((error) => {
          console.error("Failed to fetch data:", error);
        });
    }
  }, [user, navigate]);

  const handleCreateOrganization = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      // Create organization
      const orgResponse = await axios.post(
        "http://localhost:5000/api/organizations/create-organization",
        { name: orgName, billingEmail },
        { withCredentials: true }
      );

      // Create admin for the organization
      const adminResponse = await axios.post(
        "http://localhost:5000/api/users/admin-signup",
        {
          name: adminName, // Pass admin name
          email: adminEmail,
          password: adminPassword,
          organizationId: orgResponse.data.organization._id,
        },
        { withCredentials: true }
      );

      // Update organizations state with new organization
      setOrganizations([...organizations, orgResponse.data.organization]);
      setUserCounts({
        ...userCounts,
        [orgResponse.data.organization._id]: 1,
      });

      // Reset form fields
      setOrgName("");
      setBillingEmail("");
      setAdminName(""); // Reset admin name
      setAdminEmail("");
      setAdminPassword("");
    } catch (error) {
      console.error("Error creating organization or admin:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="dashboard">
      <Navbar />
      <h1>Super Admin Dashboard</h1>

      <div>
        <h2>Create Organization</h2>
        <form onSubmit={handleCreateOrganization}>
          <div>
            <label>Organization Name:</label>
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Billing Email:</label>
            <input
              type="email"
              value={billingEmail}
              onChange={(e) => setBillingEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Admin Name:</label> {/* New field for admin name */}
            <input
              type="text"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Admin Email:</label>
            <input
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Admin Password:</label>
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={isCreating}>
            {isCreating ? "Creating..." : "Create Organization and Admin"}
          </button>
        </form>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <h2>Organizations</h2>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Plan</th>
                <th>Admin</th>
                <th>Users</th>
              </tr>
            </thead>
            <tbody>
              {organizations.map((org) => (
                <tr key={org._id}>
                  <td>{org.name}</td>
                  <td>{org.plan ? org.plan.name : "No plan"}</td>
                  <td>{org.admin ? org.admin.name : ""}</td>
                  <td>{userCounts[org._id] - 1 || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default SuperAdminDashboard;
