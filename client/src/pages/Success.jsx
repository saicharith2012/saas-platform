import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

const SuccessPage = () => {
  const location = useLocation();
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const query = new URLSearchParams(location.search);
  const sessionId = query.get('session_id');

  useEffect(() => {
    const fetchSessionData = async () => {
      if (!sessionId) {
        setError('No session ID found in URL.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:5000/api/payments/checkout-session/${sessionId}`);
        setSessionData(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error fetching session data.');
        setLoading(false);
      }
    };

    fetchSessionData();
  }, [sessionId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>{sessionData.mode === "payment" ? "Payment Successful." : "Thank you for subscribing."}</h2>
      {sessionData && (
        <div>
          <p>Customer: {sessionData.customer_details.name}</p>
          <p>Email: {sessionData.customer_details.email}</p>
          <p>Amount: {(sessionData.amount_total / 100).toFixed(2)} {sessionData.currency.toUpperCase()}</p>
          <h3>Items:</h3>
          <ul>
            {sessionData.line_items.data.map(item => (
              <li key={item.id}>
                {item.description} - {item.quantity} x {item.amount_total / 100} {sessionData.currency.toUpperCase()}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SuccessPage;
