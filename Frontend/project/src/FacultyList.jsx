import React, { useEffect, useState } from "react";
import axios from "axios";
import ProfileModal from "./ProfileModel";
import "./FacultyList.css"; // Import styles

const FacultyList = () => {

  const [facultyProfiles, setFacultyProfiles] = useState([]);
  const [filteredProfiles, setFilteredProfiles] = useState([]); // Stores search results
  const [searchTerm, setSearchTerm] = useState(""); // Search input state
  const [selectedProfile, setSelectedProfile] = useState(null); // Selected faculty for modal

  useEffect(() => {
    axios.get("http://localhost:5000/all-profiles")
      .then((res) => {
        if (Array.isArray(res.data)) {
          const validProfiles = res.data.filter(faculty => faculty?.personal?.fullName);
          setFacultyProfiles(validProfiles);
          setFilteredProfiles(validProfiles); // Ensure default display
        } else {
          console.error("Invalid API response:", res.data);
        }
      })
      .catch((err) => console.error("Error fetching profiles:", err));
  }, []);

  // Handles search functionality
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProfiles(facultyProfiles); // Reset to full list when search is cleared
    } else {
      const filtered = facultyProfiles.filter(faculty =>
        faculty?.personal?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProfiles(filtered);
    }
  }, [searchTerm, facultyProfiles]); // Runs whenever searchTerm or facultyProfiles change

  const handleProfileClick = (faculty) => {
    console.log("Faculty Clicked:", faculty); // Debugging: Check if faculty data is logged
    setSelectedProfile(faculty);
  };
  return (
    <div className="searchh-faculty-container">
      {/* Search Input */}
      <input
        type="text"
        placeholder="Search Faculty by Name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)} // Update state on change
        className="search-input"
      />

      {/* Faculty Grid */}
      <div className="faculty-grid-container">
      {filteredProfiles.map((faculty) => (
        <div key={faculty._id} className="faculty-card-item" onClick={() => handleProfileClick(faculty)}>
          <div className="faculty-image-container">
            <img src={faculty?.personal?.profilePicture || "/default-avatar.png"} alt={faculty?.personal?.fullName || "Faculty"} />
          </div>
          <h3 className="faculty-card-name">{faculty?.personal?.fullName}</h3>
          <p className="faculty-card-designation">{faculty?.academic?.designation || "No Designation"}</p>
          <button className="faculty-read-more">READ MORE</button>
        </div>
      ))}
    </div>

      {/* Profile Modal */}
      {selectedProfile && <ProfileModal faculty={selectedProfile} onClose={() => setSelectedProfile(null)} />}
    </div>
  );
};

export default FacultyList;
