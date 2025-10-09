const express = require("express");
const router = express.Router();
const {
  uploadQr,
  getAllQrs,
  getOneQr,
  updateQrStatus,
  activateQr,
  deleteQr
} = require("../controllers/qrController");
const upload = require("../middlewares/uploadMiddleware");

// Upload QR
router.post("/upload", upload.single("qrImage"), uploadQr);

// Get all QRs
router.get("/", getAllQrs);

// Get one QR (latest)
router.get("/one", getOneQr);

// Get QR by ID
router.get("/:id", getOneQr);

// Update status
router.patch("/status/:id", updateQrStatus);

// ✅ Activate QR
router.patch("/activate/:id", activateQr);

// ✅ Delete QR
router.delete("/:id", deleteQr);

module.exports = router;
