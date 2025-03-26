import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./MyBlogs.css";

function UpdatedBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const fetchMyBlogs = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("User not authenticated.");

        let decoded;
        try {
          decoded = JSON.parse(atob(token.split(".")[1]));
        } catch (err) {
          throw new Error("Invalid token format.");
        }

        const userId = decoded?.userId;
        if (!userId) throw new Error("User ID not found.");

        const response = await axios.get(`http://localhost:5000/api/blogs?authorId=${userId}`);
        if (isMounted) setBlogs(response.data);
      } catch (error) {
        setError(error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMyBlogs();
    return () => { isMounted = false; };
  }, []);

  if (loading) return <p>Loading my blogs...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error.message}</p>;

  return (
    <div className="full-page-container">
      <div className="blogs-wrapper">
        {blogs.length === 0 ? (
          <p className="no-blogs-found">No blogs found.</p>
        ) : (
          <div className="blogs-layout">
            {blogs.map((blog) => (
              <div key={blog._id} className="blog-card-item" onClick={() => navigate(`/blog/${blog._id}`)}>
                {blog.image && <img src={blog.image} alt="Blog" className="blog-thumbnail-image" />}
                <p className="blog-publish-date"><small>{new Date(blog.createdAt).toLocaleString()}</small></p>
                <h3 className="blog-title-text">{blog.title}</h3>
                <div className="blog-body-content" dangerouslySetInnerHTML={{ __html: blog.content }}></div>
                <p className="blog-author-name"><strong>Author:</strong> {blog.author}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default UpdatedBlogs;
