const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const {
  saveClaim,
  getAllClaims,
  updateClaimStatus,
  getMyClaims,
} = require("../controllers/claimController");

router.get("/my", protect, getMyClaims);       // ✅ USER
router.post("/", protect, saveClaim);          // ✅ CREATE
router.get("/all", protect, getAllClaims);     // ✅ ADMIN
router.put("/:id/status", protect, updateClaimStatus);

module.exports = router;
