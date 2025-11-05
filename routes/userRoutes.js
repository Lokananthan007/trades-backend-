const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  changePassword,
  getProfile,
} = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/change-password", changePassword);
router.get("/profile", protect, getProfile);

module.exports = router;
