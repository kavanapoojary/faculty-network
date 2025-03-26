import React from "react";
import './ProfileDisplay.css';

const Profile = ({ profile, setIsEditing }) => {  // ✅ Using setIsEditing from parent
    return (
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-top">
            <div className="profile-image">
              {profile.personal?.profilePicture ? (
                <img src={profile.personal.profilePicture} alt="Profile" />
              ) : (
                <p>No Profile Picture</p>
              )}
              <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>Edit Profile</button>
            </div>

            <div className="profile-card personal-info">
              <h3>Personal Information</h3>
              <p><strong>Name:</strong> {profile.personal?.fullName || "N/A"}</p>
              <p><strong>Personal Email:</strong> {profile.personal?.personalEmail || "N/A"}</p>
              <p><strong>College Email:</strong> {profile.personal?.collegeEmail || "N/A"}</p>
              <p><strong>Phone:</strong> {profile.personal?.phone || "N/A"}</p>
              <p><strong>DOB:</strong> {profile.personal?.dob || "N/A"}</p>
              <p><strong>Gender:</strong> {profile.personal?.gender || "N/A"}</p>
              <p><strong>Address:</strong> {profile.personal?.address || "N/A"}</p>
            </div>
          </div>
        </div>

        <div className="profile-body">
          <div className="profile-card">
            <h3>Academic Information</h3>
            <p><strong>Qualification:</strong> {profile.academic?.qualification || "N/A"}</p>
            <p><strong>Specialization:</strong> {profile.academic?.specialization || "N/A"}</p>
            <p><strong>Designation:</strong> {profile.academic?.designation || "N/A"}</p>
            <p><strong>Department:</strong> {profile.academic?.department || "N/A"}</p>
          </div>

          <div className="profile-card">
            <h3>Professional Details</h3>
            <p><strong>Work Experience:</strong> {profile.professional?.workExperience || "N/A"}</p>
            <p><strong>Courses Taught:</strong> {profile.professional?.coursesTaught || "N/A"}</p>
            <p><strong>Current Research:</strong> {profile.professional?.currentResearch || "N/A"}</p>
          </div>
        </div>

        <div className="profile-body">
          <div className="profile-card">
            <h3>Research & Publications</h3>
            <p><strong>Papers Published:</strong> {profile.researchPublications?.papers || "N/A"}</p>
            <p><strong>Conferences Attended:</strong> {profile.researchPublications?.conferences || "N/A"}</p>
            <p><strong>Books Authored:</strong> {profile.researchPublications?.books || "N/A"}</p>
            <p><strong>Patents:</strong> {profile.researchPublications?.patents || "N/A"}</p>
            <p><strong>Research Grants:</strong> {profile.researchPublications?.grants || "N/A"}</p>
          </div>

          <div className="profile-card">
            <h3>Additional Information</h3>
            <p><strong>Google Scholar:</strong> {profile.additional?.googleScholar || "N/A"}</p>
            <p><strong>LinkedIn:</strong> {profile.additional?.linkedIn || "N/A"}</p>
            <p><strong>Skills:</strong> {profile.additional?.skills || "N/A"}</p>
            <p><strong>Achievements:</strong> {profile.additional?.achievements || "N/A"}</p>
          </div>
        </div>
      </div>
    );
};

export default Profile;