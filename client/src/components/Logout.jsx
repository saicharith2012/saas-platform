import React from "react";
import { useDispatch } from "react-redux";
import { logoutUser } from "../authSlice.js";
import { useNavigate, Link } from "react-router-dom";


const Logout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      dispatch(logoutUser())
        .unwrap()
        .then((response) => {
          console.log(response.message);
        });
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return <Link style={{textDecoration: "none", color: "black"}} onClick={handleLogout}>Logout</Link>;
};

export default Logout;
