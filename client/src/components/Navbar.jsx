import React from "react";
import LogoutButton from "./LogoutButton";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

export default function Navbar() {
  const { user } = useSelector((state) => state.auth);
  const isLoggedIn = user !== null;

  return (
    <div
      className="navbar"
      style={{
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
      }}
    >
      <h1>Saas Platform</h1>
      {isLoggedIn ? <LogoutButton /> :  <Link to="/login">Login</Link>}
    </div>
  );
}

