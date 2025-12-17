const asyncHandler = require("express-async-handler");
const Claim = require("../models/claim");
const Purchase = require("../models/purchase");
const ClaimTracker = require("../models/claimTracker");

/**
 * @desc    Submit withdrawal claim
 * @route   POST /api/claims
 * @access  Private (User)
 */
const saveClaim = asyncHandler(async (req, res) => {
  const { purchaseId, accountNo, ifsc, address } = req.body;

  if (!purchaseId || !accountNo || !ifsc || !address) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const purchase = await Purchase.findOne({
    _id: purchaseId,
    user: req.user._id,
  });

  if (!purchase) {
    return res.status(404).json({ message: "Purchase not found" });
  }

  // ❌ Prevent multiple pending claims
  const existingPending = await Claim.findOne({
    purchase: purchaseId,
    status: "Pending",
  });

  if (existingPending) {
    return res
      .status(400)
      .json({ message: "Pending claim already exists" });
  }

  // Get or create claim tracker
  let tracker = await ClaimTracker.findOne({
    purchase: purchaseId,
    user: req.user._id,
  });

  if (!tracker) {
    tracker = await ClaimTracker.create({
      purchase: purchaseId,
      user: req.user._id,
      lastClaimDate: purchase.createdAt,
    });
  }

  const today = new Date();
  const lastClaimDate = tracker.lastClaimDate;

  let eligible = false;
  let amount = 0;

  const daysPassed = Math.floor(
    (today - lastClaimDate) / (1000 * 60 * 60 * 24)
  );

  switch (purchase.claimType) {
    case "Weekly":
      eligible = daysPassed >= 7;
      amount = purchase.dailyIncome * 7;
      break;

    case "Monthly":
      eligible = daysPassed >= 30;
      amount = purchase.dailyIncome * 30;
      break;

    case "90Day":
      eligible = daysPassed >= 90;
      amount = purchase.invest; // full capital
      break;

    default:
      return res.status(400).json({ message: "Invalid claim type" });
  }

  if (!eligible) {
    return res.status(400).json({
      message: `Not eligible yet. Try after ${
        purchase.claimType === "Weekly"
          ? 7 - daysPassed
          : purchase.claimType === "Monthly"
          ? 30 - daysPassed
          : 90 - daysPassed
      } days`,
    });
  }

  const claim = await Claim.create({
    user: req.user._id,
    purchase: purchaseId,
    accountNo,
    ifsc,
    address,
    amount,
    status: "Pending",
  });

  tracker.lastClaimDate = today;
  await tracker.save();

  res.status(201).json({
    success: true,
    message: "Withdrawal request submitted",
    claim,
  });
});

/**
 * @desc    Get logged-in user's claims
 * @route   GET /api/claims/my
 * @access  Private (User)
 */
const getMyClaims = asyncHandler(async (req, res) => {
  const claims = await Claim.find({ user: req.user._id })
    .populate("purchase", "invest dailyIncome claimType qrName")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    claims,
  });
});

/**
 * @desc    Get all claims
 * @route   GET /api/claims/all
 * @access  Admin
 */
const getAllClaims = asyncHandler(async (req, res) => {
  const claims = await Claim.find()
    .populate("user", "username mobile")
    .populate("purchase", "invest dailyIncome claimType qrName")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    claims,
  });
});

/**
 * @desc    Update claim status
 * @route   PUT /api/claims/:id/status
 * @access  Admin
 */
const updateClaimStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!["Pending", "Accepted", "Paid"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const claim = await Claim.findById(req.params.id);

  if (!claim) {
    return res.status(404).json({ message: "Claim not found" });
  }

  claim.status = status;
  await claim.save();

  res.json({
    success: true,
    message: "Claim status updated",
    claim,
  });
});

module.exports = {
  saveClaim,
  getMyClaims,
  getAllClaims,
  updateClaimStatus,
};
