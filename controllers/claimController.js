const asyncHandler = require("express-async-handler");
const Claim = require("../models/claim");
const Purchase = require("../models/purchase");
const ClaimTracker = require("../models/claimTracker");

// ✅ Save a claim request
const saveClaim = asyncHandler(async (req, res) => {
  const { purchaseId, accountNo, ifsc, address } = req.body;

  if (!purchaseId || !accountNo || !ifsc || !address)
    return res.status(400).json({ message: "All fields are required" });

  const purchase = await Purchase.findById(purchaseId).populate("user", "username mobile");
  if (!purchase) return res.status(404).json({ message: "Purchase not found" });

  // Get or create tracker
  let tracker = await ClaimTracker.findOne({ purchase: purchaseId });
  if (!tracker) tracker = await ClaimTracker.create({ purchase: purchaseId });

  const today = new Date();
  const lastClaim = tracker.lastClaimDate || purchase.createdAt;

  let eligible = false;

  if (purchase.claimType === "Weekly") {
    let current = new Date(lastClaim);
    let workingDays = 0;
    while (current < today) {
      if (current.getDay() !== 0 && current.getDay() !== 6) workingDays++;
      current.setDate(current.getDate() + 1);
    }
    eligible = workingDays >= 5;
  } else if (purchase.claimType === "Monthly") {
    const daysPassed = Math.floor((today - lastClaim) / (1000 * 60 * 60 * 24));
    eligible = daysPassed >= 30;
  }

  if (!eligible) return res.status(400).json({ message: "Not eligible for claim yet" });

  const amount = purchase.claimType === "Weekly" ? purchase.dailyIncome * 5 : purchase.dailyIncome * 30;

  const claim = await Claim.create({
    user: req.user._id,
    purchase: purchaseId,
    accountNo,
    ifsc,
    address,
    amount,
  });

  tracker.lastClaimDate = today;
  await tracker.save();

  res.status(201).json({ message: "Claim submitted", claim });
});

// ✅ Get all claim requests
const getAllClaims = asyncHandler(async (req, res) => {
  const claims = await Claim.find()
    .populate("user", "username mobile")
    .populate("purchase", "invest dailyIncome claimType qrName")
    .sort({ createdAt: -1 });

  res.json(claims);
});

// ✅ Update claim status
const updateClaimStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["Pending", "Accepted", "Paid"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const claim = await Claim.findById(id);
  if (!claim) return res.status(404).json({ message: "Claim not found" });

  claim.status = status;
  await claim.save();

  res.json({ message: "Claim status updated", claim });
});

// ✅ Get logged-in user's claims
const getMyClaims = asyncHandler(async (req, res) => {
  const claims = await Claim.find({ user: req.user._id })
    .populate("user", "username mobile")
    .populate("purchase", "invest dailyIncome claimType qrName")
    .sort({ createdAt: -1 });

  res.json(claims);
});

module.exports = { saveClaim, getAllClaims, updateClaimStatus, getMyClaims };
