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
    let isMounted = true;
    const fetchBlogs = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/blogs");
        if (isMounted) setBlogs(response.data);
      } catch (err) {
        setError(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBlogs();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="blog-list-wrapper">
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
              <p className="blog-writer"><strong>Author:</strong> {blog.author}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ViewBlogs;
