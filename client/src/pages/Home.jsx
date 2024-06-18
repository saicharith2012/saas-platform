import React from "react";
import Products from "../components/Product";
import { useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

function Home() {
  const { user, status } = useSelector((state) => state.auth);
  const isLoggedIn = user !== null;

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <Navbar />
      <Products />
      {isLoggedIn && <Link to="/cart">Go to Cart</Link>}
      <br/>
      {isLoggedIn && <Link to="/order-history">Order History</Link>}
    </div>
  );
}

export default Home;
