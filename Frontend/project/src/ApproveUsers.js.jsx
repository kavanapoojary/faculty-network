import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const SendApproval = () => {
  const { token } = useParams();
  const [profile, setProfile] = useState(null);
  const [message, setMessage] = useState("Checking approval...");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApproval = async () => {
      try {
        const approvalResponse = await axios.get(`http://localhost:5000/approve-request/${token}`);
        console.log("Approval Response:", approvalResponse.data);
        
        if (approvalResponse.data.message !== "Approval successful") {
          setMessage(approvalResponse.data.message);
        }

        if (approvalResponse.data.userId) {
          const profileResponse = await axios.get(`http://localhost:5000/profile/${approvalResponse.data.userId}`);
          console.log("Profile Response:", profileResponse.data);
          setProfile(profileResponse.data);
        } else {
          setMessage("Approval failed. No user ID returned.");
        }
      } catch (error) {
        setMessage("Approval failed or invalid token.");
        console.error("Error fetching approval:", error);
      }
    };

    fetchApproval();
  }, [token]);

  const handleApprove = async () => {
    if (!profile) return;

    try {
      await axios.post(`http://localhost:5000/approve-user/${profile.userId}`);
      
      setMessage("Approved Successfully");

      // ✅ Keep profile visible and avoid blank screen
      setProfile({ ...profile });

      // ✅ Stay on the page for 3 seconds before redirecting
      setTimeout(() => {
        navigate(`/profile/${profile.userId}`);
      }, 3000);
    } catch (error) {
      console.error("Error approving user:", error);
      setMessage("Approval failed. Try again.");
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "20px", width: "1000px" }}>
      <div style={{ width: "900px", padding: "20px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", borderRadius: "10px", backgroundColor: "#fff" }}>
        <h2 style={{ textAlign: "center", marginBottom: "10px" }}>Approval Status</h2>
        <p style={{ textAlign: "center", color: "green" }}>{message}</p>

        {/* ✅ Fix Conditional Rendering to prevent blank screen */}
        {(profile || message === "Approved Successfully") ? (
          <div style={{ textAlign: "center" }}>
            {/* ✅ Profile Image */}
            {profile?.personal?.profilePicture ? (
              <img 
                src={profile.personal.profilePicture} 
                alt="Profile" 
                style={{ width: "120px", height: "120px", borderRadius: "50%", objectFit: "cover", marginBottom: "10px" }} 
              />
            ) : (
              <p>No Profile Image</p>
            )}

            {profile && (
              <>
                <h3>{profile.personal?.fullName}</h3>
                <p><strong>Email:</strong> {profile.personal?.collegeEmail}</p>
                <p><strong>Phone:</strong> {profile.personal?.phone}</p>
                <p><strong>DOB:</strong> {profile.personal?.dob}</p>
                <p><strong>Gender:</strong> {profile.personal?.gender}</p>
                <p><strong>Address:</strong> {profile.personal?.address}</p>

                <hr />

                <h4>Academic Details</h4>
                <p><strong>Qualification:</strong> {profile.academic?.qualification}</p>
                <p><strong>Specialization:</strong> {profile.academic?.specialization}</p>
                <p><strong>Designation:</strong> {profile.academic?.designation}</p>
                <p><strong>Department:</strong> {profile.academic?.department}</p>

                <hr />

                <h4>Professional Details</h4>
                <p><strong>Experience:</strong> {profile.professional?.workExperience} years</p>
                <p><strong>Courses Taught:</strong> {profile.professional?.coursesTaught}</p>
                <p><strong>Current Research:</strong> {profile.professional?.currentResearch}</p>

                <hr />

                <h4>Research & Publications</h4>
                <p><strong>Papers:</strong> {profile.researchPublications?.papers}</p>
                <p><strong>Conferences:</strong> {profile.researchPublications?.conferences}</p>
                <p><strong>Books:</strong> {profile.researchPublications?.books}</p>

                <hr />

                <h4>Additional Information</h4>
                <p><strong>Skills:</strong> {profile.additional?.skills}</p>
                <p><strong>Achievements:</strong> {profile.additional?.achievements}</p>
                <p>
                  <strong>Google Scholar:</strong> 
                  <a href={profile.additional?.googleScholar} target="_blank" rel="noopener noreferrer"> View</a>
                </p>
                <p>
                  <strong>LinkedIn:</strong> 
                  <a href={profile.additional?.linkedIn} target="_blank" rel="noopener noreferrer"> View</a>
                </p>
              </>
            )}

            {/* ✅ Show "Approve" button only if approval is pending */}
            {message !== "Approved Successfully" && (
              <button 
                onClick={handleApprove}
                style={{
                  backgroundColor: "#28a745",
                  color: "white",
                  padding: "10px",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  marginTop: "10px"
                }}
              >
                Approve
              </button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default SendApproval;
