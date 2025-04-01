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
  
        if (approvalResponse.data.requestDetails) {
          setProfile(approvalResponse.data.requestDetails); // ✅ Use requestDetails instead of profile
          console.log("Extracted Profile:", approvalResponse.data.requestDetails);
        }
  
        setMessage(approvalResponse.data.message);
      } catch (error) {
        setMessage("Approval failed or invalid token.");
        console.error("Error fetching approval:", error);
      }
    };
  
    fetchApproval();
  }, [token]);
  
  const handleApprove = async () => {
    if (!profile || !profile.userId) {
      setMessage("User ID is missing. Cannot approve.");
      console.error("Error: Missing userId in profile:", profile);
      return;
    }
  
    try {
      await axios.post(`http://localhost:5000/approve-user/${profile.userId}`);
  
      // ✅ Wait before fetching the updated status
      setTimeout(async () => {
        const updatedApproval = await axios.get(`http://localhost:5000/approve-request/${token}`);
        setProfile(updatedApproval.data.requestDetails);
        console.log("✅ Updated profile:", updatedApproval.data.requestDetails);
      }, 1000);
  
      setMessage("Approved Successfully");
    } catch (error) {
      console.error("Error approving user:", error);
      setMessage("Approval failed. Try again.");
    }
  };
  
  
  
  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "20px", width: "1000px" }}>
      <div style={{ width: "900px", padding: "20px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", borderRadius: "10px", backgroundColor: "#fff" }}>
      
        <p style={{ textAlign: "center", color: "green" }}>{message}</p>

        {/* Prevent blank screen */}
        {(profile || message === "Approved Successfully") ? (
          <div style={{ textAlign: "center" }}>
           

            {profile && (
              <>
                <h3>{profile.fullName || `${profile.firstName || ""} ${profile.lastName || ""}`}</h3>
                <p><strong>Email:</strong> {profile.collegeEmail || profile.email || "N/A"}</p>
                <p><strong>Phone:</strong> {profile.phone || "N/A"}</p>
 

            
                <p><strong>Institution:</strong> {profile. institution|| "N/A"}</p>
              
                <p><strong>Qualification:</strong> {profile.qualification || "N/A"}</p>
              
                <p><strong>Designation:</strong> {profile.designation || "N/A"}</p>
                <p><strong>Department:</strong> {profile.department || "N/A"}</p>

              </>
            )}

            {/* Show "Approve" button only if approval is pending */}
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