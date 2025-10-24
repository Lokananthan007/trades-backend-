const mongoose = require("mongoose");

const qrSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    qrImage: { type: String, required: true }, // base64 image
    upiId: { type: String, required: true },   // ✅ new field
    status: { type: String, default: "hide" }, // Pending, display, hide
  },
  { timestamps: true }
);

module.exports = mongoose.model("Qr", qrSchema);
