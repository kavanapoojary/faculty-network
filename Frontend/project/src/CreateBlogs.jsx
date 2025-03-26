import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import Quill styles
import "./CreateBlogs.css";

function BlogCreation() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [image, setImage] = useState(null);
  const [content, setContent] = useState("");
  const [additionalContent, setAdditionalContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [step, setStep] = useState(1); // Track step for navigation

  const handleTitleChange = (e) => setTitle(e.target.value);
  const handleAuthorChange = (e) => setAuthor(e.target.value);
  const handleImageChange = (e) => setImage(e.target.files[0]);
  const handleContentChange = (value) => setContent(value);
  const handleAdditionalContentChange = (value) => setAdditionalContent(value);

  const handleNext = () => setStep(2);
  const handleBack = () => setStep(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("User not authenticated.");
      setLoading(false);
      return;
    }

    let decoded;
    try {
      decoded = JSON.parse(atob(token.split(".")[1]));
    } catch (err) {
      setMessage("Invalid token.");
      setLoading(false);
      return;
    }

    const userId = decoded?.userId;
    if (!userId) {
      setMessage("User ID not found.");
      setLoading(false);
      return;
    }

    // ✅ Ensure additionalContent is not empty
    if (!additionalContent.trim()) {
      setMessage("Additional content cannot be empty.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("additionalContent", additionalContent);
    formData.append("author", author);
    formData.append("authorId", userId);
    if (image) {
      formData.append("image", image);
    }

    console.log("FormData before sending:", Object.fromEntries(formData.entries()));

// ✅ Debugging log

    try {
      const response = await fetch("http://localhost:5000/api/blogs", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to create blog.");
      }

      setMessage("Blog created successfully!");
      setTitle("");
      setAuthor("");
      setImage(null);
      setContent("");
      setAdditionalContent("");
      setStep(1); // Reset to first step
    } catch (error) {
      console.error("Error:", error);
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="blog-ccontainer">
      <div className="blog-ccard">
        {message && <p className="message">{message}</p>}

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div>
              <div className="form-grroup">
                <label htmlFor="title">Title</label>
                <input type="text" id="title" value={title} onChange={handleTitleChange} required />
              </div>

              <div className="form-grroup">
                <label htmlFor="author">Author</label>
                <input type="text" id="author" value={author} onChange={handleAuthorChange} required />
              </div>

              <div className="form-grroup">
                <label htmlFor="image">Image (Optional)</label>
                <input type="file" id="image" accept="image/*" onChange={handleImageChange} />
              </div>

              <div className="form-grooup">
                <label htmlFor="content">Content</label>
                <ReactQuill id="content" value={content} onChange={handleContentChange} modules={quillModules} formats={quillFormats} />
              </div>

              <button type="button" className="next-btn" onClick={handleNext} disabled={!content.trim()}>
                Continue
              </button>
            </div>
          )}

{step === 2 && (
  <div className="step-two-container"> {/* New class added */}
    <div className="form-grouup">
      
      <ReactQuill
        id="additionalContent"
        value={additionalContent}
        onChange={handleAdditionalContentChange}
        modules={quillModules}
        formats={quillFormats}
      />
    </div>
    <div className="step-two-buttons">
    <button type="button" className="back-btn" onClick={handleBack}>
      Back
    </button>
    <button
      type="submit"
      className="submit-btn"
      disabled={loading || !content.trim() || !additionalContent.trim()}
    >
      {loading ? "Creating..." : "Create Blog"}
    </button>
    </div>
  </div>
)}

        </form>
      </div>
    </div>
  );
}

// 🔥 Full Toolbar for ReactQuill
const quillModules = {
  toolbar: [
    [{ font: [] }, { size: [] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ script: "sub" }, { script: "super" }],
    [{ header: "1" }, { header: "2" }, "blockquote", "code-block"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }, { align: [] }],
    ["link", "image", "video"],
    ["clean"],
  ],
};

const quillFormats = [
  "font", "size", "bold", "italic", "underline", "strike", "color", "background", "script", "header", "blockquote", "code-block", "list", "bullet", "indent", "align", "link", "image", "video",
];

export default BlogCreation;
