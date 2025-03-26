import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai"; // Import Eye Icons
import axios from "axios";
import "./Login.css";

const Login = ({ setIsLoggedIn }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false); // Password Visibility
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/login", formData);
      localStorage.setItem("token", response.data.token);
      setIsLoggedIn(true);
      navigate("/home");
    } catch (error) {
      alert(error.response?.data?.message || "Login Failed");
    }
  };

  return (
    <div className="loginn-container">
      <h2 className="login-title">Log in</h2>
      <form onSubmit={handleLogin}>
        <div className="input-group">
          <FaEnvelope className="icon" />
          <input type="email" name="email" placeholder="Email address" onChange={handleChange} required />
        </div>

        <div className="input-group">
          <FaLock className="icon" />
          <input 
            type={showPassword ? "text" : "password"} 
            name="password" 
            placeholder="Password" 
            onChange={handleChange} 
            required 
          />
          
          {/* Eye Icon for Password Visibility */}
          <span className="eye-icon" onClick={togglePasswordVisibility}>
  {showPassword ? <AiFillEyeInvisible style={{ color: "white" }} /> : <AiFillEye style={{ color: "white" }} />}
</span>

        </div>

        {/* Forgot Password Moved Below Input */}
        <span className="forgot-password" onClick={() => navigate("/forgot-password")}>Forgot Password?</span>

        <button type="submit" className="login-button">Login to your account</button>
      </form>

      <div className="login-footer">
        <label className="remember-me">
          <input type="checkbox" /> Remember me
        </label>
        <p onClick={() => navigate("/signup")} className="signup-link">
          New here? <span>Sign in!</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
