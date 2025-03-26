import React, { useState } from "react";
import axios from "axios";

const CreateDocument = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file");
  
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("file", file);
    formData.append("userId", localStorage.getItem("userId")); // ✅ Pass userId
  
    try {
      await axios.post("http://localhost:5000/upload-document", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Document uploaded successfully!");
      setTitle("");
      setDescription("");
      setFile(null);
    } catch (error) {
      console.error("Error uploading document:", error);
      alert("Error uploading document");
    }
  };
  

  return (
    <div>
      <h2>Create Document</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <input type="file" onChange={handleFileChange} required />
        <button type="submit">Upload</button>
      </form>
    </div>
  );
};

export default CreateDocument;
