const mongoose = require("mongoose");

const claimTrackerSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    purchase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Purchase",
      required: true,
    },
    lastClaimDate: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.ClaimTracker ||
  mongoose.model("ClaimTracker", claimTrackerSchema);
