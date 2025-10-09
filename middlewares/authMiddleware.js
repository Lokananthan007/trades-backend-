const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/user");
const generateToken = require("../utils/generateToken");

// Register
exports.registerUser = async (req, res) => {
  const { mobile, username, password } = req.body;
  try {
    const userExists = await User.findOne({ mobile });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ mobile, username, password });

    res.status(201).json({
      message: "User registered successfully",
      token: generateToken(user._id),
      user: { id: user._id, username: user.username, mobile: user.mobile },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.loginUser = async (req, res) => {
  const { mobile, password } = req.body;
  try {
    const user = await User.findOne({ mobile });
    if (user && (await user.matchPassword(password))) {
      res.json({
        message: "Login successful",
        token: generateToken(user._id),
        user: { id: user._id, username: user.username, mobile: user.mobile },
      });
    } else {
      res.status(401).json({ message: "Invalid mobile or password" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change Password
exports.changePassword = async (req, res) => {
  const { mobile, oldPassword, newPassword } = req.body;
  try {
    const user = await User.findOne({ mobile });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch)
      return res.status(400).json({ message: "Old password incorrect" });

    user.password = newPassword;
    await user.save();
    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  } else {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

module.exports = { protect };
