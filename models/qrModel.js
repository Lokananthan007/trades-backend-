const mongoose = require("mongoose");

const qrSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    qrImage: { type: String, required: true }, // base64 image
    status: { type: String, default: "Pending" }, // e.g. Pending, Approved
  },
  { timestamps: true }
);

module.exports = mongoose.model("Qr", qrSchema);
