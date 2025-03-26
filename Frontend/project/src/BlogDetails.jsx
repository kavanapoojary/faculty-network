import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function BlogDetails() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setError("Invalid blog ID.");
      setLoading(false);
      return;
    }

    const fetchBlogDetails = async () => {
      try {
        console.log("Fetching blog with ID:", id);
        const response = await axios.get(`http://localhost:5000/api/blogs/${id}`);
        console.log("Full Blog Data:", response.data); // ✅ Debugging log

        setBlog(response.data);
      } catch (err) {
        console.error("Error fetching blog:", err.response ? err.response.data : err.message);
        setError(err.response?.data?.message || "Failed to load blog.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogDetails();
  }, [id]);

  if (loading) return <p>Loading blog...</p>;
  if (error) return <p style={{ color: "red", fontWeight: "bold" }}>Error: {error}</p>;

  return (
    <div className="blog-details-container">
      {blog ? (
        <div className="additional-content">
          <h3>Additional Content</h3>
          {blog.additionalContent && blog.additionalContent.trim() !== "" ? (
            <div dangerouslySetInnerHTML={{ __html: blog.additionalContent }}></div>
          ) : (
            <p style={{ color: "gray" }}>No extra content available.</p>
          )}
        </div>
      ) : (
        <p style={{ color: "red" }}>Blog not found.</p>
      )}
    </div>
  );
  
}

export default BlogDetails;
