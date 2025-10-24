const express = require("express");
const router = express.Router();

// ✅ import controllers correctly
const {
  registerUser,
  loginUser,
  changePassword,
  getProfile,
} = require("../controllers/userController");

// ✅ import protect middleware correctly
const { protect } = require("../middlewares/authMiddleware");

// Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/change-password", changePassword);
router.get("/profile", protect, getProfile);
// ✅ Get all users
router.get("/", async (req, res) => {
  try {
    const users = await require("../models/User").find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
