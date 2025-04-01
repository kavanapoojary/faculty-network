import React, { useState } from "react";
import axios from "axios";
import "./ProfileEditForm.css";
import { Camera } from "lucide-react";

const ProfileEditForm = ({ profile, setProfile, handleProfileSubmit }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  const genderOptions = ["Male", "Female", "Other"];
  const designationOptions = [
    "Professor", "Associate Professor", "Assistant Professor", "Lecturer", "Researcher", "Other"
  ];
  const departmentOptions = [
    "Computer Science", "Mathematics", "Physics", "Electrical Engineering", "Mechanical Engineering", "Other"
  ];
  const experienceOptions = ["0-2 years", "3-5 years", "6-10 years", "10+ years"];

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profilePicture", file);

    try {
      const { data } = await axios.post("http://localhost:5000/upload-profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfile((prev) => ({
        ...prev,
        personal: { ...prev.personal, profilePicture: data.imageUrl },
      }));
    } catch (error) {
      console.error("Image upload failed:", error);
    }
  };

  return (
    <div className="user-profile-container">
      <form onSubmit={handleProfileSubmit} className="user-profile-form">
        
        {/* Profile Picture Upload */}
        <div className="user-profile-modal">
          <div className="user-profile-pic-section">
            <div className="pic">
            <div className="user-profile-pic-wrapper">
              {selectedImage || profile.personal.profilePicture ? (
                <img src={selectedImage || profile.personal.profilePicture} alt="Profile Preview" className="user-profile-pic" />
              ) : (
                <p className="user-no-profile-pic">No Profile Picture</p>
              )}
              <label htmlFor="profile-upload-input" className="user-upload-icon">
                <Camera size={20} color="#36195B" />
              </label>
              <input id="profile-upload-input" type="file" accept="image/*" onChange={handleImageUpload} className="user-upload-input" />
            </div>
            </div>
          </div>

          {/* Personal Information */}
          <h3 className="user-section-title">Personal Information</h3>
          <div className="user-grid">
            {["fullName", "personalEmail", "collegeEmail", "phone", "dob", "address"].map((field) => (
              <div className="user-input-group" key={field}>
                <label>{field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}:</label>
                <input type="text" className="user-input-field" required value={profile.personal[field] || ""} 
                  onChange={(e) => setProfile({ ...profile, personal: { ...profile.personal, [field]: e.target.value } })} />
              </div>
            ))}
            <div className="user-input-group">
              <label>Gender:</label>
              <select className="user-input-field" required value={profile.personal.gender || ""} 
                onChange={(e) => setProfile({ ...profile, personal: { ...profile.personal, gender: e.target.value } })}>
                <option value="">Select Gender</option>
                {genderOptions.map((gender) => (
                  <option key={gender} value={gender}>{gender}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Academic Information */}
          <h3 className="user-section-title">Academic Information</h3>
          <div className="user-grid">
            {["qualification", "specialization", "designation"].map((field) => (
              <div className="user-input-group" key={field}>
                <label>{field.charAt(0).toUpperCase() + field.slice(1)}:</label>
                <input type="text" className="user-input-field" required value={profile.academic[field] || ""} 
                  onChange={(e) => setProfile({ ...profile, academic: { ...profile.academic, [field]: e.target.value } })} />
              </div>
            ))}
            <div className="user-input-group">
              <label>Department:</label>
              <select className="user-input-field" required value={profile.academic.department || ""} 
                onChange={(e) => setProfile({ ...profile, academic: { ...profile.academic, department: e.target.value } })}>
                <option value="">Select Department</option>
                {departmentOptions.map((department) => (
                  <option key={department} value={department}>{department}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Professional Details */}
          <h3 className="user-section-title">Professional Details</h3>
          <div className="user-grid">
            {["workExperience", "coursesTaught", "currentResearch"].map((field) => (
              <div className="user-input-group" key={field}>
                <label>{field.charAt(0).toUpperCase() + field.slice(1)}:</label>
                <input type="text" className="user-input-field" required value={profile.professional[field] || ""} 
                  onChange={(e) => setProfile({ ...profile, professional: { ...profile.professional, [field]: e.target.value } })} />
              </div>
            ))}
          </div>

          {/* Additional Details */}
          <h3 className="user-section-title">Additional Information</h3>
          <div className="user-grid">
            {["googleScholar", "linkedIn", "skills", "achievements"].map((field) => (
              <div className="user-input-group" key={field}>
                <label>{field.charAt(0).toUpperCase() + field.slice(1)}:</label>
                <input type="text" className="user-input-field" required value={profile.additional[field] || ""} 
                  onChange={(e) => setProfile({ ...profile, additional: { ...profile.additional, [field]: e.target.value } })} />
              </div>
            ))}
          </div>

          {/* Save Button */}
          <button type="submit" className="user-save-button">Save Profile</button>
        </div>
      </form>
    </div>
  );
};

export default ProfileEditForm;
