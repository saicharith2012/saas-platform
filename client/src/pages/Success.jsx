// src/components/Success.jsx

import React from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';

const Success = () => {
  const location = useLocation();
  const sessionId = new URLSearchParams(location.search).get('session_id');
  const [message, setMessage] = useState('Processing your payment...');

  useEffect(() => {
    if (sessionId) {
      axios
        .get(`/api/payment/verify-checkout-session/${sessionId}`)
        .then((response) => {
          setMessage('Payment Successful! Thank you for your purchase.');
        })
        .catch((error) => {
          console.error('Error verifying checkout session:', error);
          setMessage('Something went wrong. Please contact support.');
        });
    }
  }, [sessionId]);

  return (
    <div className="success-container">
    <Navbar/>
      <h2>Payment Status</h2>
      <p>{message}</p>
    </div>
  );
};

export default Success;
