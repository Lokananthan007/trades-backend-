const Qr = require("../models/qrModel");
const fs = require("fs");

// ✅ Upload QR with UPI ID
const uploadQr = async (req, res) => {
  try {
    const { name, upiId } = req.body;
    if (!name || !upiId) {
      return res.status(400).json({ message: "Name and UPI ID are required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const imgData = fs.readFileSync(req.file.path, { encoding: "base64" });
    const mimeType = req.file.mimetype;

    const newQr = new Qr({
      name,
      upiId,
      qrImage: `data:${mimeType};base64,${imgData}`,
    });

    await newQr.save();
    fs.unlinkSync(req.file.path);

    res.status(201).json({
      message: "QR uploaded successfully",
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

// ✅ Get one (latest) or by ID
const getOneQr = async (req, res) => {
  try {
    let qr;
    if (req.params.id) {
      qr = await Qr.findById(req.params.id);
    } else {
      qr = await Qr.findOne().sort({ createdAt: -1 });
    }

    if (!qr) return res.status(404).json({ message: "No QR found" });

    res.status(200).json(qr);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update Status
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

// ✅ Activate one QR
const activateQr = async (req, res) => {
  try {
    const { id } = req.params;

    await Qr.updateMany({}, { status: "hide" });
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

// ✅ Get displayed QR
const getDisplayedQr = async (req, res) => {
  try {
    const qr = await Qr.findOne({ status: "display" });
    if (!qr) return res.status(404).json({ message: "No QR set to display" });

    res.status(200).json(qr);
  } catch (error) {
    console.error("Error fetching displayed QR:", error);
    res.status(500).json({ message: error.message });
    return res.status(404).json({ message: "No QR set to display" });
  }
};

module.exports = {
  uploadQr,
  getAllQrs,
  getOneQr,
  updateQrStatus,
  activateQr,
  deleteQr,
  getDisplayedQr,
};
