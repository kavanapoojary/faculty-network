import React, { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { FaLock } from "react-icons/fa"; // Lock Icon
import "./ResetPassword.css";

const ResetPassword = () => {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(""); // ✅ Success/Error Message
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`http://localhost:5000/reset-password/${token}`, {
        newPassword,
        confirmPassword,
      });

      setMessage(response.data.message);
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setMessage(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="reset-password-container">
      <h2 className="reset-password-title">Reset Password</h2>
      <form className="reset-password-form" onSubmit={handleResetPassword}>
        <div className="inputt-group">
          <FaLock className="iconss" /> {/* Lock Icon */}
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div className="inputt-group">
          <FaLock className="iconss" /> {/* Lock Icon */}
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Reset Password</button>
      </form>
      {message && <p className="reset-password-message">{message}</p>}
      <p className="reset-password-link" onClick={() => navigate("/login")}>Back to Login</p>
    </div>
  );
};

export default ResetPassword;
