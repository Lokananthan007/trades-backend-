const mongoose = require("mongoose");

const purchaseSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: { type: String, required: true },  // 👈 store username
    mobile: { type: String, required: true },    // 👈 store mobile
    invest: { type: Number, required: true },
    dailyIncome: { type: Number, required: true },
    totalIncome: { type: Number, required: true },
    upiId: { type: String, required: true },
    claimType: { type: String, enum: ["Weekly", "Monthly", "90Day"], required: true },
    qrName: { type: String },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Purchase || mongoose.model("Purchase", purchaseSchema);
