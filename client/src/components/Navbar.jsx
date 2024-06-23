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
        <Link style={{ textDecoration: "none", color: "black" }} to="/">
          Saas Platform
        </Link>
      </h1>
      {isAdmin ? (
        <button className="navbar-buttons">
          <Link style={{textDecoration: "none", color: "black"}} to="/admin-dashboard">Admin Dashboard</Link>
        </button>
      ) : null}
      {isSuperAdmin ? (
        <button className="navbar-buttons">
          <Link style={{textDecoration: "none", color: "black"}} to="/superadmin-dashboard">Super Admin Dashboard</Link>
        </button>
      ) : null}
      {isLoggedIn ? (
        <>
          <Logout /> <p>{user.name}</p>{" "}
        </>
      ) : (
        <button className="navbar-buttons">
          <Link style={{textDecoration: "none", color: "black"}} to="/login">Login</Link>
        </button>
      )}
    </div>
  );
}
