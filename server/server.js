// ============================================================
// server.js  -  the starting point of the whole backend
// ------------------------------------------------------------
// Run it with:  npm start   (or)   node server/server.js
//
// What this file does:
//   1. Loads the secret settings from the .env file
//   2. Starts an Express web server
//   3. Serves the HTML/CSS/JS files inside /public
//   4. Connects to MongoDB Atlas using Mongoose
//   5. Hands every /api/auth/... request to routes/auth.js
// ============================================================

// dotenv reads server/.env and puts the values into process.env
require("dotenv").config({ path: __dirname + "/.env" });
const dns = require('dns');

// Use public DNS for MongoDB Atlas SRV resolution
dns.setServers(['8.8.8.8', '1.1.1.1']);
const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// ------------------------------------------------------------
// MIDDLEWARE - small functions that run on every request
// ------------------------------------------------------------

// Lets us read JSON that the frontend sends with fetch().
// Without this line, req.body would be undefined.
app.use(express.json());

// Serves everything in the /public folder as a normal website.
// public/index.html becomes http://localhost:5000/
app.use(express.static(path.join(__dirname, "..", "public")));

// ------------------------------------------------------------
// ROUTES
// ------------------------------------------------------------
// Everything starting with /api/auth is handled in routes/auth.js
app.use("/api/auth", authRoutes);

// If someone asks for an API route that does not exist
app.use("/api", (req, res) => {
  res.status(404).json({ success: false, message: "API route not found." });
});

// ------------------------------------------------------------
// CONNECT TO MONGODB, THEN START THE SERVER
// ------------------------------------------------------------
// We only start listening AFTER MongoDB is connected, so the app
// is never "half working".
// ------------------------------------------------------------
if (!MONGO_URI) {
  console.error("\nMONGO_URI is missing.");
  console.error("Create the file server/.env and put your connection string in it:");
  console.error("   MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/logindemo");
  console.error("   PORT=5000\n");
  process.exit(1); // stop the program
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

    // If the database drops out later (wifi lost, cluster paused, ...)
    mongoose.connection.on("error", (error) => {
      console.error("MongoDB runtime error:", error.message);
    });
    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected. Trying to reconnect...");
    });
  })
  .catch((error) => {
    console.error("\nMongoDB connection failed.");
    console.error("Reason:", error.message);
    console.error("\nThings to check:");
    console.error("  1. Is the MONGO_URI in server/.env spelled correctly?");
    console.error("  2. Did you replace <password> with your real database password?");
    console.error("  3. In Atlas, is your IP address allowed under Network Access?");
    console.error("  4. Are you connected to the internet?\n");
    process.exit(1);
  });
