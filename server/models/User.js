// ============================================================
// models/User.js
// ------------------------------------------------------------
// This file describes WHAT a "user" looks like inside MongoDB.
// In Mongoose this description is called a SCHEMA.
// A schema + a name = a MODEL, and the model is the object we
// use in our code to talk to the "users" collection.
// ============================================================

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,              // removes spaces at the start/end
    minlength: [2, "Name must be at least 2 characters"],
  },

  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,            // MongoDB will not allow two users with the same email
    lowercase: true,         // "Prince@Mail.com" is stored as "prince@mail.com"
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
  },

  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters"],
  },

  createdAt: {
    type: Date,
    default: Date.now,       // filled in automatically when the user is created
  },
});

// ------------------------------------------------------------
// PASSWORD HASHING
// ------------------------------------------------------------
// Storing a plain-text password in a database is a serious mistake:
// anyone who can read the database can read everyone's password.
// Instead we store a HASH - a scrambled, one-way version of it.
// You can turn a password into a hash, but you cannot turn a hash
// back into the password. To check a login we hash the typed
// password again and compare the two hashes.
//
// "pre('save')" means: run this function just before saving a user.
// ------------------------------------------------------------
userSchema.pre("save", async function (next) {
  // Only hash when the password is new or was changed,
  // otherwise we would hash an already-hashed password.
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10); // random data that makes the hash unique
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// A small helper we can call as: user.checkPassword("typed password")
userSchema.methods.checkPassword = function (typedPassword) {
  return bcrypt.compare(typedPassword, this.password);
};

// "User" becomes the MongoDB collection "users" (lowercase + plural).
module.exports = mongoose.model("User", userSchema);
