import React, { useState } from "react";
import "./ProfileModel.css";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io"; // Lighter arrows

const ProfileModel = ({ faculty, onClose }) => {
  const [expandedSections, setExpandedSections] = useState({});

  if (!faculty) return null;

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <>
      <div className="profile-modal-overlay" onClick={onClose}></div>
      <div className="profile-modal">
      <div className="profile-image-container">
        <button onClick={onClose} className="close-button">X</button>
</div>
        <div className="profile-header">
  <div className="profile-immg">
    <img
      src={faculty?.personal?.profilePicture || "default-profile.png"}
      alt="Profile"
    />
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
            title: "Research & Publications",
            key: "research",
            content: (
              <>
                <p><strong>Papers:</strong> {faculty?.researchPublications?.papers ?? "N/A"}</p>
                <p><strong>Conferences:</strong> {faculty?.researchPublications?.conferences ?? "N/A"}</p>
                <p><strong>Books:</strong> {faculty?.researchPublications?.books ?? "N/A"}</p>
                <p><strong>Patents:</strong> {faculty?.researchPublications?.patents ?? "N/A"}</p>
                <p><strong>Grants:</strong> {faculty?.researchPublications?.grants ?? "N/A"}</p>
              </>
            ),
          },
          {
            title: "Additional Information",
            key: "additional",
            content: (
              <>
                <p><strong>Google Scholar:</strong> <a href={faculty?.additional?.googleScholar} target="_blank" rel="noopener noreferrer">{faculty?.additional?.googleScholar ?? "N/A"}</a></p>
                <p><strong>LinkedIn:</strong> <a href={faculty?.additional?.linkedIn} target="_blank" rel="noopener noreferrer">{faculty?.additional?.linkedIn ?? "N/A"}</a></p>
                <p><strong>Skills:</strong> {faculty?.additional?.skills ?? "N/A"}</p>
                <p><strong>Achievements:</strong> {faculty?.additional?.achievements ?? "N/A"}</p>
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
