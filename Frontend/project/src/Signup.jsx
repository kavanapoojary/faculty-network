import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Signup.css";

const Signup = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    collegeEmail: "",
    phone: "",
    otp: "",
    password: "",
    confirmPassword: "",
    designation: "",
    department: "",
    institution: "",
    dob: "",
    gender: "",
    address: "",
    qualification: "",
    specialization: "",
    skills: "",
    achievements: "",
    researchInterests: "",
    profilePicture: null,
    conferences: "",
    workExperience: "",
    coursesTaught: "",
    currentResearch: "",
    papers: "",
    books: "",
    patents: "",
    grants: "",
    googleScholar: "",
    linkedIn: ""
  });

  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [approvalStatus, setApprovalStatus] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null); // Add selectedUser state

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    setFormData({ ...formData, profilePicture: e.target.files[0] });
  };

  const handleSuggestionSelect = (user) => {
    setSelectedUser(user.userId._id);
};
const checkCollegeEmail = async () => {
  console.log("checkCollegeEmail called");
  console.log("College Email:", formData.collegeEmail);
  try {
    const response = await axios.get(
      `http://localhost:5000/check-college-email?collegeEmail=${formData.collegeEmail}`
    );
    console.log("Check Email Response:", response);

    // ✅ Ensure only valid entries with userId are stored
    const filteredSuggestions = response.data.filter(user => user.userId !== null);
    
    setSuggestions(filteredSuggestions);
    setOtpSent(false);
    setSelectedUser(null);

    if (filteredSuggestions.length === 0) {
      sendOtp(); // No matches, proceed with OTP
    }
  } catch (error) {
    console.error("Check Email Error:", error);
    setMessage({ type: "error", text: "Error checking email." });
  }
};

const sendotp = async () => {
  if (!selectedUser) {
    setMessage({ type: "error", text: "Please select a user." });
    return;
  }

  try {
    const response = await axios.post("http://localhost:5000/send-approval-request", {
      selectedUserId: selectedUser,
      yourEmail: formData.collegeEmail,
      formData: { // ✅ Include user details
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        collegeEmail: formData.collegeEmail,
        designation: formData.designation,
        department: formData.department,
        institution: formData.institution,
        qualification: formData.qualification,
        specialization: formData.specialization,
      }
    });

    console.log("Approval Request Response:", response.data);
    setMessage({ type: "info", text: "Approval request sent. Waiting for approval..." });
    setOtpSent(false);
    setSuggestions([]);
    setSelectedUser(null);

    checkApprovalStatus(selectedUser);

  } catch (error) {
    console.error("Error sending approval request:", error);
    setMessage({ type: "error", text: error.response?.data?.message || "Failed to send approval request" });
  }
};

 // ✅ Automatically go to step 2 when approved
 useEffect(() => {
  console.log("Approval Status:", approvalStatus);
  if (approvalStatus === "approved") {
    setStep(9); // ✅ Go directly to password step
  }
}, [approvalStatus]);


const checkApprovalStatus = async (userId) => {
  console.log("Checking approval status for user:", userId);

  const interval = setInterval(async () => {
    try {
      const response = await axios.get("http://localhost:5000/approval-requests");
      console.log("Approval Status Response:", response.data);

      const request = response.data.find(req => req.userId.toString() === userId);
      console.log("Matching Request:", request);

      if (request?.status === "approved") {
        console.log("Approval found:", request);
        setApprovalStatus("approved");  // ✅ State updated correctly
        setStep(9);  // ✅ Move directly to password step
        setMessage({ type: "success", text: "Approved successfully!" });
        clearInterval(interval);  // ✅ Stop polling after approval
      }
    } catch (error) {
      console.error("Error checking approval status:", error);
      setMessage({ type: "error", text: "Error checking approval status." });
      clearInterval(interval);  // ✅ Stop polling on error
    }
  }, 5000);
};

  const sendOtp = async () => {
    if (!formData.email) {
      setMessage({ type: "error", text: "Please enter a valid email address." });
      return;
    }
    try {
      const response = await axios.post("http://localhost:5000/send-otp", { email: formData.email });
      setOtpSent(true);
      setMessage({ type: "success", text: response.data.message });
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Failed to send OTP" });
    }
  };

  const verifyOtp = async () => {
    if (!formData.otp) {
      setMessage({ type: "error", text: "Please enter the OTP sent to your email." });
      return;
    }
    try {
      const response = await axios.post("http://localhost:5000/verify-otp", {
        email: formData.email,
        otp: formData.otp,
      });
      if (response.data.success) {
        setStep(3);
        setMessage({ type: "success", text: "OTP verified successfully!" });
      } else {
        setMessage({ type: "error", text: response.data.message || "Invalid OTP. Please try again." });
      }
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "OTP verification failed" });
    }
  };


const handleSignup = async (e) => {
  e.preventDefault();
  if (formData.password !== formData.confirmPassword) {
    setMessage({ type: "error", text: "Passwords do not match!" });
    return;
  }

  try {
    // Upload profile picture if selected
    let profilePictureUrl = "";
    if (formData.profilePicture) {
      const formDataImage = new FormData();
      formDataImage.append("profilePicture", formData.profilePicture);

      const uploadRes = await axios.post("http://localhost:5000/upload-profile", formDataImage, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      profilePictureUrl = uploadRes.data.imageUrl;
    }

    // Create User
    const response = await axios.post("http://localhost:5000/signup", {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      collegeEmail: formData.collegeEmail,
      phone: formData.phone,
      password: formData.password,
      designation: formData.designation,
      department: formData.department,
      institution: formData.institution,
      qualification:formData.qualification,
      workExperience:formData.workExperience,
      specialization:formData.specialization,
      coursesTaught:formData.coursesTaught,
      currentResearch:formData.currentResearch,
      papers:formData.papers,
      conferences:formData.conferences,
      books:formData.books,
      patents:formData.patents,
      grants:formData.grants,
      googleScholar:formData.googleScholar,
      linkedIn:formData.linkedIn,
      skills:formData.skills,
      achievements:formData.achievements,
      dob:formData.dob,
      gender:formData.gender,
      address:formData.address,
    });

    // Get user ID from response
    const userId = response.data.userId;

    // ✅ Create Default Profile for the User
    const defaultProfile = {
      userId,
      personal: {
        fullName: `${formData.firstName} ${formData.lastName}`,
        personalEmail: formData.email,
        collegeEmail: formData.collegeEmail,
        phone: formData.phone,
        dob: formData.dob,
        gender: formData.gender,
        address: formData.address,
        profilePicture: profilePictureUrl, // ✅ Save uploaded profile picture
      },
      academic: {
        qualification: formData.qualification,
        specialization: formData.specialization,
        designation: formData.designation,
        department: formData.department,
      },
      professional: { workExperience: formData.workExperience, coursesTaught: formData.coursesTaught, currentResearch: formData.currentResearch },
      researchPublications: { papers: formData.papers, conferences: formData.conferences, books: formData.books, patents: formData.patents, grants: formData.grants },
      additional: { googleScholar: formData.googleScholar, linkedIn: formData.linkedIn, skills: formData.skills, achievements: formData.achievements },
    };

    await axios.post("http://localhost:5000/profile", defaultProfile);

    // ✅ Redirect to Profile Form to Fill Details
    setTimeout(() => navigate("/login"), 2000);
  } catch (error) {
    setMessage({ type: "error", text: error.response?.data?.message || "Signup failed" });
  }
};

  return (
    <div className="auth-container">
      {message.text && <div className={`message ${message.type}`}>{message.text}</div>}
      {step === 1 && (
        <>
          <h2>Personal & Academic Details</h2>
          <input type="text" name="firstName" placeholder="First Name" onChange={handleChange} required />
          <input type="text" name="lastName" placeholder="Last Name" onChange={handleChange} required />
          <input type="text" name="designation" placeholder="Designation" onChange={handleChange} required />
          <input type="text" name="department" placeholder="Department" onChange={handleChange} required />
          <button onClick={() => setStep(2)}>Next</button>
        </>
      )}
      {step === 2 && (
        <>
          
          <h2>Verify Email</h2>
          <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
          <button onClick={sendOtp}>Send OTP</button>
          {otpSent && (
            <>
              <input type="text" name="otp" placeholder="Enter OTP" onChange={handleChange} required />
              <button onClick={verifyOtp}>Verify OTP</button>
              
            </>
          )}
        </>
      )}
      
      
       {step === 3 && (
          <>
          <input type="file" accept="image/*" onChange={handleImageUpload} />
          <input type="text" name="phone" placeholder="Phone Number" onChange={handleChange} required />
          <input type="date" name="dob" placeholder="Date of Birth" onChange={handleChange} required />
          <select name="gender" onChange={handleChange} required>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          
          <input type="text" name="address" placeholder="Address" onChange={handleChange} required />
          <button onClick={() => setStep(4)}>Next</button>
        </>
      )}
       {step === 4 && (
        <>
          <h2>Academic Details</h2>
          <input type="text" name="designation" placeholder="Designation" onChange={handleChange} required />
          <input type="text" name="department" placeholder="Department" onChange={handleChange} required />
          <input type="text" name="institution" placeholder="Institution Name" onChange={handleChange} required />
          <input type="text" name="qualification" placeholder="Qualification" onChange={handleChange} required />
          <input type="text" name="specialization" placeholder="Specialization" onChange={handleChange} required />
          <button onClick={() => setStep(5)}>Next</button>
        </>
      )}
       {step === 5 && (
        <>
          <h2>Professional Details</h2>
          <input type="text" name="workExperience" placeholder="Work Experience" onChange={handleChange} required />
          <input type="text" name="coursesTaught" placeholder="Courses Taught" onChange={handleChange} required />
          <input type="text" name="currentResearch" placeholder="Current Research" onChange={handleChange} required />
          <button onClick={() => setStep(6)}>Next</button>
        </>
      )}
      
      {step === 6 && (
        <>
          <h2>Research & Publications</h2>
          <input type="text" name="papers" placeholder="Papers" onChange={handleChange} required />
          <input type="text" name="conferences" placeholder="Conferences" onChange={handleChange} required />
          <input type="text" name="books" placeholder="Books" onChange={handleChange} required />
          <input type="text" name="patents" placeholder="Patents" onChange={handleChange} required />
          <input type="text" name="grants" placeholder="Grants" onChange={handleChange} required />
          <button onClick={() => setStep(7)}>Next</button>
        </>
      )}
      
      {step === 7 && (
        <>
          <h2>Additional Information</h2>
        
          <input type="text" name="googleScholar" placeholder="Google Scholar" onChange={handleChange} required />
          <input type="text" name="linkedIn" placeholder="LinkedIn" onChange={handleChange} required />
          <input type="text" name="skills" placeholder="Skills" onChange={handleChange} required />
          <input type="text" name="achievements" placeholder="Achievements" onChange={handleChange} required />
          <button onClick={() => setStep(8)}>Next</button>


        </>
      )}
     
      {step === 8 && (
        <>
     <h2>Set Password</h2>
         
            <input type="password" name="password" placeholder="New Password" onChange={handleChange} required />
            <input type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} required />
           


 <button onClick={() => setStep(9)}>Next</button>     
</>
      )}

       {step === 9 && (
        <>
       
           <input type="email" name="collegeEmail" placeholder="College Email" onChange={handleChange} required />
          <h2>College Email Verification</h2>
          
          <button onClick={checkCollegeEmail}>Check Email</button>

          {suggestions.length > 0 && (
    <div>
        <h3>Existing Accounts:</h3>
        <ul>
  {suggestions.map((user) => {
    if (!user.userId) return null; // ✅ Skip invalid entries

    return (
      <li key={user.userId._id}>
        <label>
          <input
            type="radio"
            name="selectedUser"
            value={user.userId._id}
            checked={selectedUser === user.userId._id}
            onChange={() => handleSuggestionSelect(user)}
          />
          {user.userId.firstName} {user.userId.lastName} ({user.personal.collegeEmail})
        </label>
      </li>
    );
  })}
</ul>

        {selectedUser && (
            <button onClick={sendotp}>
                Send Approval Request
            </button>
        )}
    </div>
)}  
 <form onSubmit={handleSignup}>
         <button type="submit">Signup</button>  
         </form>
        </>
      )}   
    </div>
  );
};

export default Signup;