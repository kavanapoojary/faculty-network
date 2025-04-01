import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ProfileModel.css";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

const ProfileModel = ({ faculty, onClose }) => {
  const [expandedSections, setExpandedSections] = useState({});
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(false);

  if (!faculty) return null;

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  
  const handleProfileClick = async (authorId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/users/${authorId}`);
      setSelectedAuthor(response.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching author details:", error);
    }
  };
  
  
  // Fetch publications from backend
  useEffect(() => {
    const fetchPublications = async () => {
      const scholarId = faculty?.additional?.googleScholar?.split("user=")[1];
      if (!scholarId) return;

      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:5000/scholar-publications`, {
          params: { scholarId },
        });
        setPublications(response.data);
      } catch (error) {
        console.error("Error fetching publications:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPublications();
  }, [faculty]);

  return (
    <>
      <div className="profile-modal-overlay" onClick={onClose}></div>
      <div className="profile-modal">
        <button onClick={onClose} className="close-button">X</button>

        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-img">
            <img src={faculty?.personal?.profilePicture || "default-profile.png"} alt="Profile" />
          </div>
          <div className="profile-details">
            <h2 className="profile-name">{faculty?.personal?.fullName ?? "N/A"}</h2>
            <p><strong>Email:</strong> {faculty?.personal?.personalEmail ?? "N/A"}</p>
            <p><strong>College Email:</strong> {faculty?.personal?.collegeEmail ?? "N/A"}</p>
            <p><strong>Phone:</strong> {faculty?.personal?.phone ?? "N/A"}</p>
            <p><strong>Date of Birth:</strong> {faculty?.personal?.dob ?? "N/A"}</p>
            <p><strong>Gender:</strong> {faculty?.personal?.gender ?? "N/A"}</p>
            <p><strong>Address:</strong> {faculty?.personal?.address ?? "N/A"}</p>
          </div>
        </div>

        {/* Expandable Sections */}
        {[
          {
            title: "Academic Information",
            key: "academic",
            content: (
              <>
                <p><strong>Qualification:</strong> {faculty?.academic?.qualification ?? "N/A"}</p>
                <p><strong>Specialization:</strong> {faculty?.academic?.specialization ?? "N/A"}</p>
               
              <p><strong>Designation:</strong> {faculty?.academic?.designation || "N/A"}</p>
              <p><strong>Department:</strong> {faculty?.academic?.department || "N/A"}</p>
                
              </>
            ),
          },
          {
            title: "Professional Experience",
            key: "professional",
            content: (
              <>
                <p><strong>Work Experience:</strong> {faculty?.professional?.workExperience ?? "N/A"}</p>
                <p><strong>Courses Taught:</strong> {faculty?.professional?.coursesTaught ?? "N/A"}</p>
                <p><strong>Current Research:</strong> {faculty?.professional?.currentResearch ?? "N/A"}</p>
              </>
            ),
          },
          {
            title: "Additional Information",
            key: "additional",
            content: (
              <>
                <p><strong>Google Scholar:</strong> <a href={faculty?.additional?.googleScholar} target="_blank" rel="noopener noreferrer">View Profile</a></p>
                <p><strong>LinkedIn:</strong> <a href={faculty?.additional?.linkedIn} target="_blank" rel="noopener noreferrer">LinkedIn</a></p>
                <p><strong>Skills:</strong> {faculty?.additional?.skills ?? "N/A"}</p>
                <p><strong>Achievements:</strong> {faculty?.additional?.achievements ?? "N/A"}</p>
              </>
            ),
          },
          {
            title: "Publications",
            key: "publications",
            content: (
              <>
                {loading ? (
                  <p>Loading publications...</p>
                ) : publications.length > 0 ? (
                  <ul>
                    {publications.map((publication, index) => (
                      <li key={index}>
                        <strong>{publication.title}</strong>{" "}
                        {publication.link && (
                          <a href={publication.link} target="_blank" rel="noopener noreferrer" style={{ color: "blue", textDecoration: "underline", marginLeft: "10px" }}>
                            View
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No publications available.</p>
                )}
              </>
            ),
          },
        ].map(({ title, key, content }) => (
          <div key={key} className={`profile-section ${expandedSections[key] ? "expanded" : ""}`}>
            <h3 onClick={() => toggleSection(key)} className="section-header">
              {title}
              <span className="arrow">{expandedSections[key] ? <IoIosArrowUp /> : <IoIosArrowDown />}</span>
            </h3>

            <div className={`profile-section-content ${expandedSections[key] ? "show" : ""}`}>
              {content}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ProfileModel;
