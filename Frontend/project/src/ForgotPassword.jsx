import React, { useState } from "react";
import axios from "axios";
import { FaEnvelope } from "react-icons/fa"; // Email Icon
import { useNavigate } from "react-router-dom";
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/forgot-password", { email });
      setMessage(response.data.message);
      setTimeout(() => navigate("/"), 3000); // Redirect to login after 3 seconds
    } catch (error) {
      setMessage(error.response?.data?.message || "Error sending reset email.");
    }
  };

  return (
    <div className="forgot-password-container">
      <h2 className="forgot-password-title">Forgot Password</h2>
      <form className="forgot-password-form" onSubmit={handleSubmit}>
        <div className="input-groupp">
          <FaEnvelope className="icons" /> {/* Email Icon */}
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit">Send Reset Link</button>
      </form>
      {message && <p className="forgot-password-message">{message}</p>}
      <p className="forgot-password-link" onClick={() => navigate("/")}>Back to Login</p>
    </div>
  );
};

export default ForgotPassword;
