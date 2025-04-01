require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto"); // For generating random verification tokens
const nodemailer = require("nodemailer"); // For sending emails
const { type } = require("os");
const { request } = require("http");
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const otpStorage = {}; // Temporary in-memory storage (Use DB for production)


const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads")); // Serve static files

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected Successfully!"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// ✅ User Schema (For Signup & Login)
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  phone: String,
  password: String,
  isVerified: { type: Boolean, default: false },
  otp: String, // Store hashed OTP
  otpExpires: Date, // OTP expiration time
});

const User = mongoose.model("User", userSchema);
const approvalRequestSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true, index: true }, // ✅ Indexed for faster lookups
  userId: { type: [mongoose.Schema.Types.ObjectId], ref: "User", required: true }, // ✅ Changed to an array of ObjectIds
  requestorEmail: { type: String, required: true, lowercase: true }, // ✅ Ensure case-insensitive emails
  requestorDetails: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true },
    collegeEmail: { type: String, required: true, lowercase: true },
    designation: { type: String, required: true },
    department: { type: String, required: true },
    institution: { type: String, required: true },
    qualification: { type: String, required: true },
    specialization: { type: String, required: true },
  },
  createdAt: { type: Date, default: Date.now, expires: "7d" }, // ✅ Auto-delete after 7 days
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
});


const ApprovalRequest = mongoose.model("ApprovalRequest", approvalRequestSchema);
module.exports = ApprovalRequest;

// ✅ Profile Schema
const profileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Link profile to user
  personal: {
    fullName: String,
    personalEmail: String,
    collegeEmail: String,
    phone: String,
    dob: String,
    gender: String,
    address: String,
    profilePicture: String,
  },
  academic: {
    qualification: String,
    specialization: String,
    designation: String,
    department: String,
  },
  professional: {
    workExperience: String,
    coursesTaught: String,
    currentResearch: String,
  },
  researchPublications: {
    papers: String,
    conferences: String,
    books: String,
    patents: String,
    grants: String,
  },
  additional: {
    googleScholar: String,
    linkedIn: String,
    skills: String,
    achievements: String,
    futureResearchPlans: String,
  },
});

const Profile = mongoose.model("Profile", profileSchema);

// ✅ Post Schema
const postSchema = new mongoose.Schema({
  photo: String,
  comment: String,
});
const Post = mongoose.model("Post", postSchema);

// ✅ Blog Schema


const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  additionalContent: { type: String },  // ✅ Make sure this field exists
  image: { type: String },
  author: { type: String, required: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

const Blog = mongoose.model("Blog", BlogSchema);
module.exports = Blog;
   
const documentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  fileUrl: String,
  uploadedAt: { type: Date, default: Date.now }
});

const Document = mongoose.model("Document", documentSchema);



// ✅ Multer Storage Configuration
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// ✅ Signup Route

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS, // App password (not your personal password)
  },
});
app.post("/signup", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      designation,
      department,
      institution,
    } = req.body;
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ Check if user exists
    const existingUser = await User.findOne({ email });
    if (!existingUser || !existingUser.isVerified) {
      return res
        .status(400)
        .json({ message: "Please verify your email before signing up." });
    }



    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    existingUser.password = hashedPassword;
    existingUser.designation = designation;
    existingUser.department = department;
    existingUser.institution = institution;
    await existingUser.save();

    res.status(201).json({ message: "Signup successful", userId: existingUser._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});
app.get("/check-college-email", async (req, res) => {
  try {
    const { collegeEmail } = req.query;
    console.log("Checking college email:", collegeEmail);

    if (!collegeEmail) return res.status(400).json({ message: "Email is required" });

    const domain = collegeEmail.substring(collegeEmail.lastIndexOf("@") + 1);
    console.log("Extracted domain:", domain);

    if (!domain) return res.status(400).json({ message: "Invalid email format" });

    const suggestions = await Profile.find({ "personal.collegeEmail": { $regex: `@${domain}$`, $options: "i" } })
      .populate("userId", "_id firstName lastName email")
      .select("personal.collegeEmail personal.fullName personal.profilePicture userId");

    // ✅ Ensure userId exists before accessing properties
    const uniqueSuggestions = [];
    const seenUserIds = new Set();

    suggestions.forEach(user => {
      if (user.userId && user.userId._id) {  // Ensure userId exists
        if (!seenUserIds.has(user.userId._id.toString())) {
          uniqueSuggestions.push(user);
          seenUserIds.add(user.userId._id.toString());
        }
      } else {
        console.warn("Skipping user with missing userId:", user);
      }
    });

    console.log("Final Suggestions:", uniqueSuggestions);
    res.json(uniqueSuggestions);
  } catch (error) {
    console.error("Error checking college email:", error);
    res.status(500).json({ message: "Error checking email" });
  }
});



// ✅ Send Approval Request (Fixes Token Generation & Email Sending)
app.post("/send-approval-request", async (req, res) => {
  try {
    const { selectedUserIds, yourEmail, formData } = req.body;
    if (!selectedUserIds || !yourEmail || !formData) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    let userIds = []
    const approvalToken = crypto.randomBytes(20).toString("hex");
    for (const selectedUserId of selectedUserIds) {
      const selectedUser = await User.findById(selectedUserId);
      if (!selectedUser) continue;
      userIds.push(mongoose.Types.ObjectId(selectedUserId))
      const profile = await Profile.findOne({ userId: selectedUserId });
      if (!profile?.personal?.collegeEmail) continue;

      

      

      const approvalLink = `http://localhost:5173/response/${approvalToken}`;

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: profile.personal.collegeEmail,
        subject: "Approval Request",
        html: `
          <p><strong>Approval Request from ${formData.firstName} ${formData.lastName}:</strong></p>
          <p><strong>Email:</strong> ${yourEmail}</p>
          <p><strong>Approval Link:</strong> <a href="${approvalLink}">Approve Request</a></p>
        `,
      });
    }
    const aprreq = await new ApprovalRequest({
      token: approvalToken,
      userId: userIds,
      requestorEmail: yourEmail,
      requestorDetails: formData,
    }).save();
    console.log(aprreq)
    res.json({ message: "Approval requests sent successfully!" });
  } catch (error) {
    console.error("Error sending approval request:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Fetch Approval Request by Token (Fix: Return User & Profile)
app.get("/approve-request/:token", async (req, res) => {
  console.log("Token route hit:", req.params.token);
  try {
    const { token } = req.params;

    const approval = await ApprovalRequest.findOne({ token }); // ✅ Populate User Data
    if (!approval) {
      return res.status(404).json({ message: "Invalid approval token" });
    }

    res.json({
      message: "Approval request fetched successfully",
      requestDetails: {
        userId: approval.userId?._id?.toString(),
        status: approval.status,  // ✅ Send correct status
        requestorEmail : approval.requestorEmail,
      },
    });
  } catch (error) {
    console.error("Error fetching approval request:", error);
    res.status(500).json({ message: "Server error" });
  }
  console.log("Received token:", token);
  console.log("Approval Request Found:", approval);

});


// ✅ Approve User (Fix: Use Mongoose)


app.post("/approve-user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const objectIdUserId = new mongoose.Types.ObjectId(userId); // ✅ Convert to ObjectId

    // ✅ Update user status in `User` collection
    const user = await User.findByIdAndUpdate(objectIdUserId, { status: "approved" }, { new: true });

    if (!user) {
      return res.status(400).json({ success: false, message: "User not found or already approved" });
    }

    // ✅ Update approval request status in `ApprovalRequest`
    const approvalRequest = await ApprovalRequest.findOneAndUpdate(
      { userId: objectIdUserId },  // ✅ Ensure we're querying with ObjectId
      { status: "approved" },  // ✅ Update status
      { new: true }
    );

    if (!approvalRequest) {
      return res.status(400).json({ success: false, message: "Approval request not found" });
    }

    console.log("✅ ApprovalRequest updated successfully:", approvalRequest); // Debugging log

    res.json({ success: true, message: "User approved successfully" });
  } catch (error) {
    console.error("Approval Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});


// ✅ Fetch Approval Requests
app.get("/approval-requests", async (req, res) => {
  try {
    const requests = await ApprovalRequest.find({}, "userId status updatedAt").sort({ updatedAt: -1 });
    res.json(requests);
  } catch (error) {
    console.error("Error fetching approval requests:", error);
    res.status(500).json({ message: "Error fetching approval requests" });
  }
});

app.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required." });
  }

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "User not found." });

  if (!user.otp || !user.otpExpires || Date.now() > user.otpExpires) {
    return res.status(400).json({ message: "OTP expired. Request a new one." });
  }

  const isOtpValid = await bcrypt.compare(otp, user.otp);
  if (!isOtpValid) return res.status(400).json({ message: "Invalid OTP. Try again." });

  // ✅ Mark user as verified and clear OTP
  user.isVerified = true;
  user.otp = null;
  user.otpExpires = null;
  await user.save();

  res.json({ success: true, message: "OTP verified successfully!" });
});

app.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    // ✅ Generate OTP (6-digit random number)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOTP = await bcrypt.hash(otp, 10);
    const otpExpires = Date.now() + 5 * 60 * 1000; // OTP valid for 5 minutes

    // ✅ Check if user exists in DB
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({ email, otp: hashedOTP, otpExpires, isVerified: false });
    } else {
      user.otp = hashedOTP;
      user.otpExpires = otpExpires;
    }
    await user.save();

    // ✅ Send OTP via Email using Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASS, // App password (not personal password)
      },
      tls: {
        rejectUnauthorized: false, // ✅ Ignore self-signed certificate issues
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`📩 OTP sent to ${email}: ${otp}`); // Debug log (Remove in production)

    res.json({ success: true, message: "OTP sent successfully!" });
  } catch (error) {
    console.error("❌ Error sending OTP:", error);
    res.status(500).json({ error: "Failed to send OTP. Try again later." });
  }
});
    

// ✅ Middleware to verify token
const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.userId = decoded.userId;
    next();
  });
};

// ✅ Change Password API
app.put("/change-password", authenticateUser, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // ✅ Check if current password is correct
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect current password" });

    // ✅ Hash and update new password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Server error" });
  }
});


app.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp)
    return res.status(400).json({ message: "Email and OTP are required." });

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "User not found." });

  if (!user.otp || !user.otpExpires || Date.now() > user.otpExpires) {
    return res.status(400).json({ message: "OTP expired. Request a new one." });
  }

  const isOtpValid = await bcrypt.compare(otp, user.otp);
  if (!isOtpValid) return res.status(400).json({ message: "Invalid OTP. Try again." });

  // ✅ Mark user as verified and clear OTP
  user.isVerified = true;
  user.otp = null;
  user.otpExpires = null;
  await user.save();

  res.json({ success: true, message: "OTP verified successfully!" });
});

// ✅ Login Route
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res
        .status(403)
        .json({ message: "Please verify your email before logging in." });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Error logging in" });
  }
});


// ✅ Forgot Password - Request Reset Link
app.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate Reset Token (JWT)
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // Token valid for 15 minutes
    await user.save();

    const resetLink = `http://localhost:5173/reset-password/${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      text: `Click the link to reset your password: ${resetLink}`,
      html: `<p>Click the link to reset your password: <a href="${resetLink}">Reset Password</a></p>`
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "Password reset link sent to your email." });
  } catch (error) {
    console.error("Error sending password reset link:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Reset Password
app.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({ message: "Both fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Verify JWT Token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(400).json({ message: "Invalid or Expired Token" });
    }

    // Find user by decoded ID
    const user = await User.findOne({ _id: decoded.id });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Hash the new password
    user.password = await bcrypt.hash(newPassword, 10);

    // Clear reset token
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ message: "Password reset successfully!" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Server error" });
  }
});


app.get("/reset-password/:token", async (req, res) => {
  res.send("This is the reset password page. Implement frontend to handle this."); 
});



const SERPAPI_KEY = process.env.SERPAPI_KEY;

app.get("/scholar-publications", async (req, res) => {
  const { scholarId } = req.query;

  if (!scholarId) {
    return res.status(400).json({ message: "Scholar ID is required" });
  }

  try {
    console.log("Fetching publications for Scholar ID:", scholarId);

    const url = `https://serpapi.com/search.json?engine=google_scholar_author&author_id=${scholarId}&api_key=${SERPAPI_KEY}`;
    const response = await axios.get(url);

    console.log("API Response:", response.data);

    const publications = response.data.articles || response.data.results || [];
    res.json(publications);
  } catch (error) {
    console.error("Error fetching publications:", error.response?.data || error.message);
    res.status(500).json({ message: "Error fetching publications", error: error.message });
  }
});



// ✅ Search Faculty by Name
app.get("/search", async (req, res) => {
  try {
    const { query } = req.query; // Get search query from frontend

    if (!query) return res.status(400).json({ message: "Search query is required" });

    // ✅ Perform a case-insensitive search
    const results = await Profile.find({
      "personal.fullName": { $regex: query, $options: "i" },
    });

    res.json(results);
  } catch (error) {
    console.error("Error searching profiles:", error);
    res.status(500).json({ message: "Error searching profiles" });
  }
});

// ✅ Upload Profile Picture
app.post("/upload-profile", upload.single("profilePicture"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  res.json({ imageUrl: `http://localhost:5000/uploads/${req.file.filename}` });
});

// ✅ Create Profile
app.post("/profile", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "User ID is required." });

    // ✅ Check if user exists
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found." });

    const newProfile = new Profile(req.body);
    await newProfile.save();
    res.json(newProfile);
  } catch (error) {
    console.error("Error saving profile:", error);
    res.status(500).json({ error: "Error saving profile" });
  }
});

// ✅ Get All Profiles
app.get("/all-profiles", async (_, res) => {
  try {
    const profiles = await Profile.find();
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ error: "Error fetching profiles" });
  }
});

app.get("/profile/:userId", async (req, res) => {
  try {
    const { userId } = req.params; // Get userId from URL
    if (!userId) return res.status(400).json({ error: "User ID is required" });

    const profile = await Profile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: "Error fetching profile" });
  }
});

app.put("/profile/:id", async (req, res) => {
  try {
    const { id } = req.params; // Get profile ID from URL
    const updatedProfile = req.body; // Get updated data

    const profile = await Profile.findByIdAndUpdate(id, updatedProfile, {
      new: true,
    });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json(profile);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Create Post with Image Upload
app.post("/posts", upload.single("photo"), async (req, res) => {
  try {
    const newPost = new Post({
      photo: req.file ? `http://localhost:5000/uploads/${req.file.filename} ` : "",
      comment: req.body.comment,
    });
    await newPost.save();
    res.json(newPost);
  } catch (error) {
    console.status(500).json({ error: "Error saving post" });
  }
});

// ✅ Get All Posts
app.get("/posts", async (_, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: "Error fetching posts" });
  }
});

// ✅ Create Blog Post
app.post("/api/blogs", upload.single("image"), async (req, res) => {
  try {
    console.log("Received Blog Data:", req.body); // ✅ Debugging log

    const { title, content, additionalContent, author, authorId } = req.body;

    if (!title || !content || !author || !authorId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    console.log("additionalContent before saving:", additionalContent); // ✅ Debugging log

    const imagePath = req.file ? req.file.filename : null;

    const newBlog = new Blog({
      title,
      content,
      additionalContent: additionalContent || "", // ✅ Ensure `additionalContent` is stored
      image: imagePath,
      author,
      authorId,
    });

    await newBlog.save();
    res.status(201).json({ message: "Blog created successfully", newBlog });
  } catch (error) {
    console.error("Error creating blog:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


// ✅ Fetch All Blogs
app.get("/api/blogs", async (req, res) => {
  try {
    const { authorId } = req.query;
    
    let filter = {};
    if (authorId) {
      filter.authorId = authorId;
    }

    const blogs = await Blog.find(filter);

    // ✅ Ensure `additionalContent` is included in the response
    const updatedBlogs = blogs.map(blog => ({
      ...blog._doc,
      image: blog.image ? `http://localhost:5000/uploads/${blog.image}` : null,
      additionalContent: blog.additionalContent || "No additional content available." 
    }));
    
    res.json(updatedBlogs);
    
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ message: "Failed to fetch blogs." });
  }
});

app.get("/api/blogs/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found." });
    }

    console.log("Retrieved Blog Data:", blog); // ✅ Debugging log

    res.json(blog); // ✅ Send actual `additionalContent`
  } catch (error) {
    console.error("Error fetching blog:", error);
    res.status(500).json({ message: "Server error" });
  }
});




app.post("/upload-document", upload.single("file"), async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!req.file) return res.status(400).json({ error: "File is required" });

    const newDocument = new Document({
      title,
      description,
      fileUrl: `http://localhost:5000/uploads/${req.file.filename}`
    });

    await newDocument.save();
    res.status(201).json({ message: "Document uploaded successfully", newDocument });
  } catch (error) {
    console.error("Error uploading document:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/documents", async (req, res) => {
  try {
    const documents = await Document.find();
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: "Error fetching documents" });
  }
});


app.post("/logout", (req, res) => {
  res.clearCookie("token"); // If using cookies
  req.session.destroy(); // If using sessions
  res.status(200).json({ message: "Logged out successfully" });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));