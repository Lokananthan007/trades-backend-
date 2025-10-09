const mongoose = require("mongoose");

const claimSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    purchase: { type: mongoose.Schema.Types.ObjectId, ref: "Purchase", required: true },
    accountNo: { type: String, required: true },
    ifsc: { type: String, required: true },
    address: { type: String, required: true },
    amount: { type: Number, required: true },
     status: { type: String, enum: ["Pending", "Accepted", "Paid"], default: "Pending" }, // ✅ new field
  },
  { timestamps: true }
);

module.exports = mongoose.models.Claim || mongoose.model("Claim", claimSchema);
