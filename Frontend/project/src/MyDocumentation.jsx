import React, { useEffect, useState } from "react";
import axios from "axios";

const MyDocuments = () => {
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/documents")
      .then((res) => setDocuments(res.data))
      .catch((err) => console.error("Error fetching documents:", err));
  }, []);
  
  return (
    <div>
      <h2>My Documents</h2>
      <ul>
        {documents.map((doc) => (
          <li key={doc._id}>
            <h3>{doc.title}</h3>
            <p>{doc.description}</p>
            <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">View File</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MyDocuments;

