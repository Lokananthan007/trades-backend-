const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  changePassword,
  getProfile,
  getAllUsers,
} = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/change-password", changePassword);
router.get("/profile", protect, getProfile);
router.get("/", protect, getAllUsers);

module.exports = router;
