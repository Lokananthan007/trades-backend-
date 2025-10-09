const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { saveClaim, getAllClaims, updateClaimStatus, getMyClaims } = require("../controllers/claimController");

// ✅ User's own claims
router.get("/my", protect, getMyClaims);

router.put("/:id/status", protect, updateClaimStatus); // update status

router.post("/", protect, saveClaim); // <-- error points here

// ✅ Get all claims (admin)
router.get("/all", protect, getAllClaims);

module.exports = router;
