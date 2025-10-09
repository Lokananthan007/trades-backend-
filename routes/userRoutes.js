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

module.exports = router;
