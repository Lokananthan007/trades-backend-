const Qr = require("../models/qrModel");
const fs = require("fs");

// ✅ Upload QR (save base64 directly in DB)
const uploadQr = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const imgData = fs.readFileSync(req.file.path, { encoding: "base64" });
    const mimeType = req.file.mimetype;

    const newQr = new Qr({
      name: req.body.name,
      qrImage: `data:${mimeType};base64,${imgData}`,
    });

    await newQr.save();

    // Delete temp file
    fs.unlinkSync(req.file.path);

    res.status(201).json({
      message: "QR uploaded and saved successfully",
      data: newQr,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get all QRs
const getAllQrs = async (req, res) => {
  try {
    const qrs = await Qr.find().sort({ createdAt: -1 });
    res.status(200).json(qrs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get one QR (latest or by ID)
const getOneQr = async (req, res) => {
  try {
    let qr;
    if (req.params.id) {
      qr = await Qr.findById(req.params.id);
    } else {
      qr = await Qr.findOne().sort({ createdAt: -1 }); // latest
    }

    if (!qr) return res.status(404).json({ message: "No QR found" });

    res.status(200).json(qr);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update QR status
const updateQrStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const qr = await Qr.findByIdAndUpdate(id, { status }, { new: true });
    if (!qr) return res.status(404).json({ message: "QR not found" });

    res.status(200).json(qr);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Activate one QR (set others to "hide")
const activateQr = async (req, res) => {
  try {
    const { id } = req.params;

    // First, set all others to "hide"
    await Qr.updateMany({}, { status: "hide" });

    // Then activate the selected one
    const qr = await Qr.findByIdAndUpdate(id, { status: "display" }, { new: true });
    if (!qr) return res.status(404).json({ message: "QR not found" });

    res.status(200).json({ message: "QR activated successfully", data: qr });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Delete QR
const deleteQr = async (req, res) => {
  try {
    const { id } = req.params;
    const qr = await Qr.findByIdAndDelete(id);
    if (!qr) return res.status(404).json({ message: "QR not found" });

    res.status(200).json({ message: "QR deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadQr,
  getAllQrs,
  getOneQr,
  updateQrStatus,
  activateQr,
  deleteQr
};
