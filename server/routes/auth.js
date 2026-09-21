// ============================================================
// routes/auth.js
// ------------------------------------------------------------
// These are the API endpoints the frontend talks to with fetch().
// A "route" is just: a URL + a method (GET/POST) + what to do.
//
//   POST /api/auth/register  -> create a new user in MongoDB
//   POST /api/auth/login     -> check email + password in MongoDB
//   GET  /api/auth/me        -> who is logged in right now?
//   POST /api/auth/logout    -> forget the logged-in user
// ============================================================

const express = require("express");
const User = require("../models/User");

const router = express.Router();

// ------------------------------------------------------------
// A VERY simple "who is logged in" store.
// A real app would use JSON Web Tokens or express-session.
// For this assignment we keep one variable in memory so that
// GET /api/auth/me has something to answer with. It is reset
// every time the server restarts - that is fine for a demo.
// ------------------------------------------------------------
let currentUser = null;

// ============================================================
// POST /api/auth/register
// ============================================================
router.post("/register", async (req, res) => {
  try {
    // 1. Read what the browser sent in the request body.
    const { name, email, password } = req.body;

    // 2. Server-side validation.
    //    The frontend checks too, but never trust the frontend alone -
    //    anyone can send a request without using your page.
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are all required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    // 3. Ask MongoDB: does this email already exist?
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "That email is already registered. Try logging in instead.",
      });
    }

    // 4. Create the document. The password is hashed automatically
    //    by the pre('save') hook inside models/User.js.
    const user = await User.create({ name, email, password });

    console.log(`New user saved to MongoDB: ${user.email} (_id: ${user._id})`);

    // 5. Reply to the browser. Never send the password back.
    return res.status(201).json({
      success: true,
      message: "Account created. You can log in now.",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    // Mongoose validation errors (bad email format, short name, ...)
    if (error.name === "ValidationError") {
      const firstMessage = Object.values(error.errors)[0].message;
      return res.status(400).json({ success: false, message: firstMessage });
    }

    // Duplicate key error from the unique index on email
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "That email is already registered.",
      });
    }

    console.error("Register error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong on the server. Please try again.",
    });
  }
});

// ============================================================
// POST /api/auth/login
// ============================================================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Enter both your email and password.",
      });
    }

    // 1. Look the user up in MongoDB by email.
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "No account found with that email.",
      });
    }

    // 2. Compare the typed password with the stored hash.
    const passwordMatches = await user.checkPassword(password);
    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password. Check it and try again.",
      });
    }

    // 3. Remember who logged in (simple demo version).
    currentUser = { id: user._id, name: user.name, email: user.email };

    console.log(`Login verified against MongoDB: ${user.email}`);

    return res.json({
      success: true,
      message: "Login successful.",
      user: currentUser,
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong on the server. Please try again.",
    });
  }
});

// ============================================================
// GET /api/auth/me  - used by the dashboard page
// ============================================================
router.get("/me", (req, res) => {
  if (!currentUser) {
    return res.status(401).json({ success: false, message: "Not logged in." });
  }
  return res.json({ success: true, user: currentUser });
});

// ============================================================
// POST /api/auth/logout
// ============================================================
router.post("/logout", (req, res) => {
  currentUser = null;
  return res.json({ success: true, message: "Logged out." });
});

module.exports = router;
