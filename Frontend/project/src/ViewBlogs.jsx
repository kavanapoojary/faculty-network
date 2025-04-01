import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./ViewBlogs.css";

function ViewBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchBlogs = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/blogs", { signal });
        const blogsData = response.data;

        // Fetch author details for each blog
        const blogWithAuthors = await Promise.all(
          blogsData.map(async (blog) => {
            if (blog.authorId) {
              try {
                const authorResponse = await axios.get(`http://localhost:5000/api/users/${blog.authorId}`, { signal });
                return { ...blog, author: authorResponse.data.fullName, authorProfilePhoto: authorResponse.data.profilePicture };
              } catch (error) {
                console.error("Error fetching author details:", error);
                return { ...blog, author: "Unknown Author", authorProfilePhoto: null };
              }
            }
            return { ...blog, author: "Unknown Author", authorProfilePhoto: null };
          })
        );

        setBlogs(blogWithAuthors);
      } catch (err) {
        if (axios.isCancel(err)) {
          console.log("Request canceled", err.message);
        } else {
          console.error("Error fetching blogs:", err);
          setError(err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();

    return () => controller.abort(); // Cleanup request on unmount
  }, []);

  if (loading) return <p>Loading blogs...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="blog-list-wrapper">
      <div className="header-section">
        <h1>Faculty</h1>
        <h3>Home/Blogs</h3>
      </div>
  
      <div className="blog-card-layout">
        {blogs.length === 0 ? (
          <p className="empty-blog-message">No blogs available.</p>
        ) : (
          blogs.map((blog) => (
            <div 
              key={blog._id} 
              className="single-blog-card" 
              onClick={() => navigate(`/blog/${blog._id}`)}
            >

              {blog.image && <img src={blog.image} alt="Blog" className="blog-thumbnail" />}
              
              <p className="blog-post-date"><small>{new Date(blog.createdAt).toLocaleString()}</small></p>
              <h3 className="blog-heading">{blog.title}</h3>
              <div className="blog-summary" dangerouslySetInnerHTML={{ __html: blog.content }}></div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ViewBlogs;
