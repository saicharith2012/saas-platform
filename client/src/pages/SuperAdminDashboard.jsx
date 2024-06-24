import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";
import Navbar from "../components/Navbar";
import CreatePlanForm from "../components/createPlanForm";

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

  // New state for plans
  const [plans, setPlans] = useState([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);

  // New state for modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState({});

  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
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

      const fetchPlans = async () => {
        try {
          const response = await axios.get("http://localhost:5000/api/plans", {
            withCredentials: true,
          });
          setPlans(response.data); // Set plans state
          setIsLoadingPlans(false); // Set loading to false after fetching plans
        } catch (error) {
          console.error("Error fetching plans:", error);
        }
      };

      fetchOrganizations()
        .then(fetchUserCounts)
        .then(fetchPlans)
        .catch((error) => {
          console.error("Failed to fetch data:", error);
        });
    }
  }, [user, navigate, plans]);

  const handleCreateOrganization = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const orgResponse = await axios.post(
        "http://localhost:5000/api/organizations/create-organization",
        { name: orgName, billingEmail },
        { withCredentials: true }
      );

      await axios.post(
        "http://localhost:5000/api/users/admin-signup",
        {
          name: adminName, // Pass admin name
          email: adminEmail,
          password: adminPassword,
          organizationId: orgResponse.data.organization._id,
        },
        { withCredentials: true }
      );

      setOrganizations([...organizations, orgResponse.data.organization]);
      setUserCounts({
        ...userCounts,
        [orgResponse.data.organization._id]: 1,
      });

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

  const handleDeletePlan = async (planId) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/plans/delete-plan/${planId}`,
        {
          withCredentials: true,
        }
      );
      setPlans(plans.filter((plan) => plan._id !== planId));
    } catch (error) {
      console.error("Error deleting plan:", error);
    }
  };

  const handleEditPlan = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `http://localhost:5000/api/plans/update-plan/${currentPlan._id}`,
        currentPlan,
        {
          withCredentials: true,
        }
      );
      setPlans(
        plans.map((plan) =>
          plan._id === currentPlan._id ? response.data : plan
        )
      );
      setIsModalOpen(false); // Close the modal
    } catch (error) {
      console.error("Error updating plan:", error);
    }
  };

  const openEditModal = (plan) => {
    setCurrentPlan(plan);
    setIsModalOpen(true);
  };

  const closeEditModal = () => {
    setIsModalOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentPlan((prevPlan) => ({
      ...prevPlan,
      [name]: value,
    }));
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

      {isLoadingPlans ? (
        <p>Loading plans...</p>
      ) : (
        <div>
          <h2>Plans</h2>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Price Per User Per Year</th>
                <th>User Limit</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr key={plan._id}>
                  <td>{plan.name}</td>
                  <td>{plan.description}</td>
                  <td>{plan.pricePerUserPerYear}</td>
                  <td>{!plan.userLimit ? "NA" : plan.userLimit - 1}</td>
                  <td>
                    <button onClick={() => openEditModal(plan)}>Edit</button>
                    <button onClick={() => handleDeletePlan(plan._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CreatePlanForm />

      <Modal isOpen={isModalOpen} onRequestClose={closeEditModal}>
        <h2>Edit Plan</h2>
        <form onSubmit={handleEditPlan}>
          <div>
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={currentPlan.name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Description:</label>
            <input
              type="text"
              name="description"
              value={currentPlan.description}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Price Per User Per Year:</label>
            <input
              type="number"
              name="pricePerUserPerYear"
              value={currentPlan.pricePerUserPerYear}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>User Limit:</label>
            <input
              type="number"
              name="userLimit"
              value={currentPlan.userLimit}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit">Save Changes</button>
          <button type="button" onClick={closeEditModal}>
            Cancel
          </button>
        </form>
      </Modal>
    </div>
  );
}

export default SuperAdminDashboard;
