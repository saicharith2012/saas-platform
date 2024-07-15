import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../authSlice.js";
import Navbar from "./Navbar.jsx";

function LoginForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, status /*error*/ } = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Handle redirection based on user role after successful login
  useEffect(() => {
    if (user) {
      // Redirect based on user role
      if (user.role === "Super Admin") {
        navigate("/superadmin-dashboard");
      } else if (user.role === "Admin") {
        navigate("/admin-dashboard");
      } else if (user.role === "User") {
        navigate("/");
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic client-side validation
    if (!email || !password) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    try {
      dispatch(loginUser({ email, password }));
      setErrorMessage(""); // Clear error message on successful login
    } catch (err) {
      setErrorMessage("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="login-form-container">
      <Navbar/>
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {status === "loading" && <p>Logging in...</p>}
        <button
          type="submit"
          className="login-button"
          disabled={status === "loading"}
        >
          Login
        </button>
      </form>
    </div>
  );
}

export default LoginForm;
