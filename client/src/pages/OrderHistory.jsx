import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import Navbar from "../components/Navbar";

function OrderHistory({ userId }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state) => state.auth);


  useEffect(() => {
    const fetchOrderHistory = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/users/${user._id}/orders`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          withCredentials: true
        });
        setOrders(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching order history:", error);
        setLoading(false);
      }
    };

    fetchOrderHistory();
  }, [user]);

  return (
    <div className="order-history-container">
    <Navbar/>
      <h2>Order History</h2>
      {loading ? (
        <p>Loading order history...</p>
      ) : (
        <div className="order-list">
          {orders.map((order) => (
            <div key={order._id} className="order-item">
              <h3>Order ID: {order._id}</h3>
              <p>Order Status: {order.orderStatus}</p>
              <p>Order Date: {new Date(order.createdAt).toLocaleDateString()}</p>
              <p>Products:</p>
              <ul>
                {order.products.map((productItem) => (
                  <li key={productItem.product._id}>
                    {productItem.product.name} - Quantity: {productItem.quantity}
                  </li>
                ))}
              </ul>
              <hr />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OrderHistory;
