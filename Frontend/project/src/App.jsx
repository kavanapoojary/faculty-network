import React, { useState, useEffect } from "react";
import axios from "axios";
import FacultyList from "./FacultyList"; 
import Profile from "./ProfileDisplay";
import ProfileForm from "./ProfileEditForm";
import RightSidebar from "./RightSidebar";
import Signup from "./Signup";
import Login from "./Login"; 
import BlogDetails from "./BlogDetails";
import BlogCreation from "./CreateBlogs";
import "./App.css";
import ViewBlogs from "./ViewBlogs"; // ✅ Home now displays blogs
import MyBlogs from "./MyBlogs";
import CreateDocument from "./CreateDocumentation";
import ViewDocuments from "./ViewDocumentation";
import MyDocuments from "./MyDocumentation";
import SendAprroval from "./ApproveUsers.js";
import ForgotPassword from "./ForgotPassword"; 
import ResetPassword from "./ResetPassword"; 

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token")); 
  const [tab, setTab] = useState("home");
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
  
    const userId = JSON.parse(atob(token.split(".")[1])).userId;
  
    axios.get(`http://localhost:5000/profile/${userId}`)
      .then((res) => {
        if (res.data) {
          setProfile(res.data);
        } else {
          setProfile(null);
          setIsEditing(true);
        }
      })
      .catch((err) => console.error("Error fetching profile:", err));
  }, []);
  
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      if (profile?._id) {
        const { data } = await axios.put(`http://localhost:5000/profile/${profile._id}`, profile);
        setProfile(data);
      } else {
        const { data } = await axios.post("http://localhost:5000/profile", profile);
        setProfile(data);
      }
      setIsEditing(false);
    } catch (err) {
      console.error("Error submitting profile:", err);
    }
  };

  return (
    <Router>
      <div className="container">
        {!isLoggedIn ? (
          <Routes>
            <Route path="/signup" element={<Signup setIsLoggedIn={setIsLoggedIn} />} />
            <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
            <Route path="*" element={<Navigate to="/login" />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
          </Routes>
        ) : (
          <>
           <RightSidebar setIsLoggedIn={setIsLoggedIn} />

            <div className="main-content">
              <Routes>
                <Route path="/" element={<ViewBlogs />} /> {/* ✅ Home displays blogs */}
                <Route path="/home" element={<Navigate to="/" />} /> 
                <Route path="/search" element={<FacultyList />} /> {/* ✅ Search displays faculty list */}
                
                <Route
                  path="/profile"
                  element={
                    profile && profile.personal.fullName ? (
                      isEditing ? (
                        <ProfileForm profile={profile} setProfile={setProfile} handleProfileSubmit={handleProfileSubmit} />
                      ) : (
                        <Profile profile={profile} setIsEditing={setIsEditing} />
                      )
                    ) : (
                      <ProfileForm 
                        profile={{ personal: {}, academic: {}, professional: {}, researchPublications: {}, additional: {} }} 
                        setProfile={setProfile} 
                        handleProfileSubmit={handleProfileSubmit} 
                      />
                    )
                  }
                />
                <Route path="/create-blog" element={<BlogCreation />} />
                <Route path="/viewblogs" element={<ViewBlogs />} />
                <Route path="/my-blogs" element={<MyBlogs />} />
                <Route path="/blog/:id" element={<BlogDetails />} />
                <Route path="/create-documentation" element={<CreateDocument />} />
                <Route path="/documentation" element={<ViewDocuments />} />
                <Route path="/my-documentation" element={<MyDocuments />} />
                <Route path="/response/:token" element={<SendAprroval/>}/>
                
              </Routes>
            </div>
          </>
        )}
      </div>
    </Router>
  );
};

export default App;
