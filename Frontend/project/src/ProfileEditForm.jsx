import React, { useState } from "react";
import axios from "axios";
import "./ProfileEditForm.css";
import { Camera } from "lucide-react";

const ProfileForm = ({ profile, setProfile, handleProfileSubmit }) => {
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
    <form onSubmit={handleProfileSubmit} className="profile-form">
       
    
          {/* Profile Picture Upload */}
          <div className="modal-content">
          <div className="profile-picture-section">
        <div className="profile-pic-container">
            {selectedImage || profile.personal.profilePicture ? (
                <img src={selectedImage || profile.personal.profilePicture} alt="Profile Preview" className="profile-pic" />
            ) : (
                <p className="no-profile-text">No Profile Picture</p>
            )}
            <label htmlFor="file-upload" className="upload-icon">
                <Camera size={20} color="#36195B" />
            </label>
            <input id="file-upload" type="file" accept="image/*" onChange={handleImageUpload} className="file-input" />
        </div>
    
       
    
    
    
          {/* Personal Information */}
          <h3 className="section-title">Personal Information</h3>
          <div className="form-grid">
          <div className="form-group">
            <label>Full Name:</label>
            <input type="text" className="form-input" required
              value={profile.personal.fullName || ""}
              onChange={(e) => setProfile({ ...profile, personal: { ...profile.personal, fullName: e.target.value } })}
            />
          </div>
    
          <div className="form-group">
            <label>Personal Email:</label>
            <input type="email" className="form-input" required
              value={profile.personal.personalEmail || ""}
              onChange={(e) => setProfile({ ...profile, personal: { ...profile.personal, personalEmail: e.target.value } })}
            />
          </div>
    
          <div className="form-group">
            <label>College Email:</label>
            <input type="email" className="form-input" required
              value={profile.personal.collegeEmail || ""}
              onChange={(e) => setProfile({ ...profile, personal: { ...profile.personal, collegeEmail: e.target.value } })}
            />
          </div>
    
          <div className="form-group">
            <label>Phone:</label>
            <input type="text" className="form-input" required
              value={profile.personal.phone || ""}
              onChange={(e) => setProfile({ ...profile, personal: { ...profile.personal, phone: e.target.value } })}
            />
          </div>
    
          <div className="form-group">
            <label>DOB:</label>
            <input type="date" className="form-input" required
              value={profile.personal.dob || ""}
              onChange={(e) => setProfile({ ...profile, personal: { ...profile.personal, dob: e.target.value } })}
            />
          </div>
    
          <div className="form-group">
              <label>Gender:</label>
              <select className="form-input" required
                value={profile.personal.gender || ""}
                onChange={(e) => setProfile({ ...profile, personal: { ...profile.personal, gender: e.target.value } })}
              >
                <option value="">Select Gender</option>
                {genderOptions.map((gender) => (
                  <option key={gender} value={gender}>{gender}</option>
                ))}
              </select>
            </div>
          <div className="form-group">
            <label>Address:</label>
            <input type="text" className="form-input" required
              value={profile.personal.address || ""}
              onChange={(e) => setProfile({ ...profile, personal: { ...profile.personal, address: e.target.value } })}
            />
          </div>
          </div>
    
          {/* Academic Information */}
          <h3 className="section-title">Academic Information</h3>
          <div className="form-grid">
          <div className="form-group">
            <label>Qualification:</label>
            <input type="text" className="form-input" required
              value={profile.academic.qualification || ""}
              onChange={(e) => setProfile({ ...profile, academic: { ...profile.academic, qualification: e.target.value } })}
            />
          </div>
    
          <div className="form-group">
            <label>Specialization:</label>
            <input type="text" className="form-input" required
              value={profile.academic.specialization || ""}
              onChange={(e) => setProfile({ ...profile, academic: { ...profile.academic, specialization: e.target.value } })}
            />
          </div>
    
          <div className="form-group">
              <label>Designation:</label>
              <select className="form-input" required
                value={profile.academic.designation || ""}
                onChange={(e) => setProfile({ ...profile, academic: { ...profile.academic, designation: e.target.value } })}
              >
                <option value="">Select Designation</option>
                {designationOptions.map((designation) => (
                  <option key={designation} value={designation}>{designation}</option>
                ))}
              </select>
            </div>
    
          <div className="form-group">
              <label>Department:</label>
              <select className="form-input" required
                value={profile.academic.department || ""}
                onChange={(e) => setProfile({ ...profile, academic: { ...profile.academic, department: e.target.value } })}
              >
                <option value="">Select Department</option>
                {departmentOptions.map((department) => (
                  <option key={department} value={department}>{department}</option>
                ))}
              </select>
            </div>
          </div>
    
          {/* Professional Details */}
          <h3 className="section-title">Professional Details</h3>
          <div className="form-grid">
         
          <div className="form-group">
              <label>Work Experience:</label>
              <select className="form-input" required
                value={profile.professional.workExperience || ""}
                onChange={(e) => setProfile({ ...profile, professional: { ...profile.professional, workExperience: e.target.value } })}
              >
                <option value="">Select Experience</option>
                {experienceOptions.map((experience) => (
                  <option key={experience} value={experience}>{experience}</option>
                ))}
              </select>
            </div>
       
    
          <div className="form-group">
          <label>Courses Taught:</label>
          <input type="text" className="form-input" required value={profile.professional.coursesTaught || ""} onChange={(e) => setProfile({ ...profile, professional: { ...profile.professional, coursesTaught: e.target.value } })} />
          </div>
          <div className="form-group">
          <label>Current Research:</label>
          <input type="text"className="form-input"  required value={profile.professional.currentResearch || ""} onChange={(e) => setProfile({ ...profile, professional: { ...profile.professional, currentResearch: e.target.value } })} />
          </div>
           </div>
    
          {/* Research Publications */}
          <h3  className="section-title">Research Publications</h3>
          <div className="form-grid">
          <div className="form-group">
          <label>Research Papers:</label>
          <input type="text"  className="form-input"required value={profile.researchPublications.papers || ""} onChange={(e) => setProfile({ ...profile, researchPublications: { ...profile.researchPublications, papers: e.target.value } })} />
          </div>
          <div className="form-group">
          <label>Conferences:</label>
          <input type="text" className="form-input" required value={profile.researchPublications.conferences || ""} onChange={(e) => setProfile({ ...profile, researchPublications: { ...profile.researchPublications, conferences: e.target.value } })} />
    </div>
    <div className="form-group">
          <label>Books:</label>
          <input type="text"className="form-input" required value={profile.researchPublications.books || ""} onChange={(e) => setProfile({ ...profile, researchPublications: { ...profile.researchPublications, books: e.target.value } })} />
    </div>
    <div className="form-group">
          <label>Patents:</label>
          <input type="text"className="form-input" required value={profile.researchPublications.patents || ""} onChange={(e) => setProfile({ ...profile, researchPublications: { ...profile.researchPublications, patents: e.target.value } })} />
    </div>
    <div className="form-group">
          <label>Grants:</label>
          <input type="text"className="form-input" required value={profile.researchPublications.grants || ""} onChange={(e) => setProfile({ ...profile, researchPublications: { ...profile.researchPublications, grants: e.target.value } })} />
    </div>
    </div>
          {/* Additional Information */}
          <h3 className="section-title">Additional Information</h3>
          <div className="form-grid">
          <div className="form-group">
            <label>Google Scholar:</label>
            <input type="text" className="form-input" required
              value={profile.additional.googleScholar || ""}
              onChange={(e) => setProfile({ ...profile, additional: { ...profile.additional, googleScholar: e.target.value } })}
            />
          </div>
    
          <div className="form-group">
              <label>LinkedIn:</label>
              <input type="text"  className="form-input" required value={profile.additional.linkedIn || ""} onChange={(e) => setProfile({ ...profile, additional: { ...profile.additional, linkedIn: e.target.value } })} />
            </div>
            
    
          <div className="form-group">
          <label>Skills:</label>
          <input type="text"  className="form-input" required value={profile.additional.skills || ""} onChange={(e) => setProfile({ ...profile, additional: { ...profile.additional, skills: e.target.value } })} />
            </div>
         
          <div className="form-group">
          <label>Achievements:</label>
          <input type="text"className="form-input"  required value={profile.additional.achievements || ""} onChange={(e) => setProfile({ ...profile, additional: { ...profile.additional, achievements: e.target.value } })} />
          </div>
          </div>
          {/* Save Button */}
          <button type="submit" className="save-button">Save Profile</button>
          </div>
          </div>
        </form>
  );
};

export default ProfileForm;