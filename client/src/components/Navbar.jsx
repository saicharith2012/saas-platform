import React from "react";
import Logout from "./Logout";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

export default function Navbar() {
  const { user } = useSelector((state) => state.auth);
  const isLoggedIn = user !== null;
  const isAdmin = user && user.role === "Admin";
  const isSuperAdmin = user && user.role === "Super Admin";
  return (
    <div
      className="navbar"
      style={{
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
      }}
    >
      <h1>
        <Link style={{textDecoration: "none", color: "black"}} to="/">
          Saas Platform
        </Link>
      </h1>
      {isAdmin ? <Link className="navbar-link" to="/admin-dashboard">Admin Dashboard</Link> : null}
      {isSuperAdmin? <Link className="navbar-link" to="/superadmin-dashboard">Super Admin Dashboard</Link> : null}
      {isLoggedIn ? <><Logout/> <p>{user.name}</p> </>: <Link className="navbar-link" to="/login">Login</Link>}
    </div>
  );
}
