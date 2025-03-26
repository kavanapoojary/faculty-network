
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MdOutlineSearch, MdOutlineMenu, MdClose, MdOutlineHome, MdOutlineLibraryBooks, MdNoteAlt, MdOutlineSettings, MdOutlinePerson, MdLogout } from "react-icons/md";
import "./RightSidebar.css"; 
import logo4 from "./assets/logo4.webp"; 

const RightSidebar = ({ setIsLoggedIn }) => { 
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false); // State for logout confirmation

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Function to show the logout confirmation modal
  const confirmLogout = () => {
    setShowLogoutConfirm(true);
  };

  // Function to handle actual logout
  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove authentication token
    setIsLoggedIn(false); // Update authentication state
    navigate("/login"); // Redirect to login page
    setShowLogoutConfirm(false); // Close the modal
  };

  return (
    <div className="relative">
      {/* Show image only on the home page */}
   
      {/* Top Right Menu Button */}
      <div className="fixed top-6 right-6 flex items-center gap-7 z-50">
        <div className="top-right-icons">
          {location.pathname === "/" && (
           <MdOutlineSearch
           className="icon cursor-pointer"
           style={{ fontSize: "30px", marginRight: "2px", color: "black" }} 
           onClick={() => navigate("/search")}
         />
         
          )}
          <div className={`menu-toggle ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <MdClose className="menu-icon" /> : <MdOutlineMenu className="menu-icon" />}
          </div>
        </div>
      </div>

      {/* Sidebar Navigation */}
      {menuOpen && (
        <div className="overlay" onClick={() => setMenuOpen(false)}>
          <div className="sidebar" onClick={(e) => e.stopPropagation()}>
            <ul className="nav-links">
              <li onClick={() => navigate("/")}>
                <MdOutlineHome className="inline-block mr-2" /> Home
              </li>
              <li onClick={() => navigate("/create-blog")}>
                <MdNoteAlt className="inline-block mr-2" /> Create Blog
              </li>
              <li onClick={() => navigate("/my-blogs")}>
                <MdOutlineLibraryBooks className="inline-block mr-2" /> My Blogs
              </li>
             
              <li onClick={() => navigate("/profile")}>
                <MdOutlinePerson className="inline-block mr-2" /> Profile
              </li>
              <li onClick={confirmLogout} className="logout">
                <MdLogout className="inline-block mr-2" /> Logout
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="logout-modal">
          <div className="modal-content">
            <h3>Are you sure you want to log out?</h3>
            <div className="modal-buttons">
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
              <button className="cancel-btn" onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
             
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RightSidebar;
