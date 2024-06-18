// client/src/pages/Cart.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import Navbar from '../components/Navbar';
import { loadStripe } from '@stripe/stripe-js';


const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

function Cart() {
  const [cart, setCart] = useState([]);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/users/${user._id}/cart`, {
          withCredentials: true,
        });
        setCart(response.data);
      } catch (error) {
        console.error('Error fetching cart:', error);
      }
    };

    if (user) {
      fetchCart();
    }
  }, [user]);

  const handleCheckout = async () => {
    const stripe = await stripePromise;

    const response = await axios.post(
      'http://localhost:5000/api/payments/create-checkout-session/products',
      {},
      { withCredentials: true }
    );

    const {sessionId} = response.data;

    const result = await stripe.redirectToCheckout({
      sessionId: sessionId,
    });

    if (result.error) {
      console.error('Stripe checkout error:', result.error.message);
    }
  };

  return (
    <div>
      <Navbar />
      <h1>Your Cart</h1>
      {cart.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <>
        <ul>
          {cart.map((item) => (
            <li key={item.product._id}>
              <p>Product Name: {item.product.name}</p>
              <p>Quantity: {item.quantity}</p>
              <p>Price: {item.product.price}</p>
              <p>Total: {item.quantity * item.product.price}</p>
            </li>
          ))}
        </ul>
        <button onClick={handleCheckout}>Checkout</button>
        </>
      )}
    </div>
  );
}

export default Cart;
