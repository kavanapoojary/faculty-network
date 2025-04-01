import React, { useState, useEffect } from "react";
import axios from "axios";
import './ProfileDisplay.css';

const UserProfile = ({ profile, setIsEditing }) => {
  const [publications, setPublications] = useState([]);
  const [expandedSections, setExpandedSections] = useState({
    personal: false,
    professional: false,
    academic: false,
    additional: false,
  });

  useEffect(() => {
    if (profile.additional?.googleScholar && profile.additional.googleScholar.includes("user=")) {
      const scholarId = profile.additional.googleScholar.split("user=")[1].split("&")[0]; // Extract ID safely

      axios.get(`http://localhost:5000/scholar-publications?scholarId=${scholarId}`)
        .then(response => setPublications(response.data))
        .catch(error => console.error("Error fetching publications:", error));
    }
  }, [profile.additional?.googleScholar]);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="container">
    <div className="wrap">
      <div className="user-profile-header">
        <div className="user-avatar-container">
          <div className="user-avatar">
            {profile.personal?.profilePicture ? (
              <img src={profile.personal.profilePicture} alt="User Avatar" />
            ) : (
              <p>No Profile Picture</p>
            )}
          </div>
          <button className="user-edit-btn" onClick={() => setIsEditing(true)}>Edit Profile</button>
        </div>
      </div>

      <div className="user-profile-content">
        
        {/* Personal Information */}
        <div className="user-card">
          <div className="section-headeer" onClick={() => toggleSection("personal")}>
            <h3>Personal Information</h3>
            <span>{expandedSections.personal ? "▲" : "▼"}</span>
          </div>
          {expandedSections.personal && (
            <div className="section-content">
              <p><strong>Name:</strong> {profile.personal?.fullName || "N/A"}</p>
              <p><strong>Personal Email:</strong> {profile.personal?.personalEmail || "N/A"}</p>
              <p><strong>College Email:</strong> {profile.personal?.collegeEmail || "N/A"}</p>
              <p><strong>Phone:</strong> {profile.personal?.phone || "N/A"}</p>
              <p><strong>DOB:</strong> {profile.personal?.dob || "N/A"}</p>
              <p><strong>Gender:</strong> {profile.personal?.gender || "N/A"}</p>
              <p><strong>Address:</strong> {profile.personal?.address || "N/A"}</p>
            </div>
          )}
        </div>

        {/* Professional Details */}
        <div className="user-card">
          <div className="section-headeer" onClick={() => toggleSection("professional")}>
            <h3>Professional Experience</h3>
            <span>{expandedSections.professional ? "▲" : "▼"}</span>
          </div>
          {expandedSections.professional && (
            <div className="section-content">
              <p><strong>Work Experience:</strong> {profile.professional?.workExperience || "N/A"}</p>
              <p><strong>Courses Taught:</strong> {profile.professional?.coursesTaught || "N/A"}</p>
              <p><strong>Current Research:</strong> {profile.professional?.currentResearch || "N/A"}</p>
            </div>
          )}
        </div>

        {/* Academic Information */}
        <div className="user-card">
          <div className="section-headeer" onClick={() => toggleSection("academic")}>
            <h3>Academic Information</h3>
            <span>{expandedSections.academic ? "▲" : "▼"}</span>
          </div>
          {expandedSections.academic && (
            <div className="section-content">
              <p><strong>Qualification:</strong> {profile.academic?.qualification || "N/A"}</p>
              <p><strong>Specialization:</strong> {profile.academic?.specialization || "N/A"}</p>
              <p><strong>Designation:</strong> {profile.academic?.designation || "N/A"}</p>
              <p><strong>Department:</strong> {profile.academic?.department || "N/A"}</p>
            </div>
          )}
        </div>

        {/* Additional Information */}
        <div className="user-card">
          <div className="section-headeer" onClick={() => toggleSection("additional")}>
            <h3>Additional Information</h3>
            <span>{expandedSections.additional ? "▲" : "▼"}</span>
          </div>
          {expandedSections.additional && (
            <div className="section-content">
              <p><strong>Google Scholar:</strong> 
                {profile.additional?.googleScholar ? (
                  <a href={profile.additional.googleScholar} target="_blank" rel="noopener noreferrer">
                    View Profile
                  </a>
                ) : "N/A"}
              </p>
              <p><strong>LinkedIn:</strong> {profile.additional?.linkedIn || "N/A"}</p>
              <p><strong>Skills:</strong> {profile.additional?.skills || "N/A"}</p>
              <p><strong>Achievements:</strong> {profile.additional?.achievements || "N/A"}</p>
            </div>
          )}
        </div>

        {/* Publications - Always Visible */}
        <div className="pub">
        <div className="pub">
          <h3>Publications</h3>
          {publications.length > 0 ? (
            <ul>
              {publications.map((pub, index) => (
                <li key={index}>
                  <strong>{pub.title}</strong> <br />
                  <small>{pub.citation}</small>
                  <a href={pub.link} target="_blank" rel="noopener noreferrer"> View</a>
                </li>
              ))}
            </ul>
          ) : (
            <p>No Publications Found</p>
          )}
        </div>
        </div>
      </div>
    </div>
    </div>);
};

export default UserProfile;
