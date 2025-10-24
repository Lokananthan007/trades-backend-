const express = require("express");
const router = express.Router();
const {
  uploadQr,
  getAllQrs,
  getOneQr,
  updateQrStatus,
  activateQr,
  deleteQr,
  getDisplayedQr,
} = require("../controllers/qrController");
const upload = require("../middlewares/uploadMiddleware");

// ✅ Upload QR
router.post("/upload", upload.single("qrImage"), uploadQr);

// ✅ Get all QRs
router.get("/", getAllQrs);

// ✅ Get displayed QR — must be before /:id
router.get("/displayed", getDisplayedQr);

// ✅ Get one (latest)
router.get("/one", getOneQr);

// ✅ Get QR by ID
router.get("/:id", getOneQr);

// ✅ Update status
router.patch("/status/:id", updateQrStatus);

// ✅ Activate QR
router.patch("/activate/:id", activateQr);

// ✅ Delete QR
router.delete("/:id", deleteQr);

module.exports = router;
