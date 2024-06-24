import React from "react";
import { useDispatch } from "react-redux";
import { logoutUser } from "../authSlice.js";
import { useNavigate} from "react-router-dom";


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

  return <button className="navbar-buttons" onClick={handleLogout}>Logout</button>;
};

export default Logout;
