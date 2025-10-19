const asyncHandler = require("express-async-handler");
const Purchase = require("../models/purchase");
const User = require("../models/User"); // 👈 import user mode

// ✅ Utility: Check if today is weekend
function isWeekend(date = new Date()) {
  const day = date.getDay(); // 0 = Sunday, 6 = Saturday
  return day === 0 || day === 6;
}

// Save new purchase
const savePurchase = asyncHandler(async (req, res) => {
  const { invest, dailyIncome, upiId, claimType, qrName } = req.body;

  if (!invest || !dailyIncome || !upiId || !claimType) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // ✅ get logged-in user
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const purchase = new Purchase({
    user: user._id,
    username: user.username,   // 👈 save username
    mobile: user.mobile,       // 👈 save mobile
    invest,
    dailyIncome,
    totalIncome: 0,
    upiId,
    claimType,
    qrName,
  });

  const savedPurchase = await purchase.save();
  res.status(201).json(savedPurchase);
});

// Get purchases for logged-in user
const getPurchases = asyncHandler(async (req, res) => {
  const purchases = await Purchase.find({ user: req.user._id }).sort({ createdAt: -1 });

  const user = await User.findById(req.user._id).select("username mobile");

  res.json({ user, purchases });
});


// Get all purchases (admin)
const getAllPurchases = asyncHandler(async (req, res) => {
  const purchases = await Purchase.find()
    .populate("user", "username mobile") // ✅ populate user info
    .sort({ createdAt: -1 });
  res.json(purchases);
});


// ✅ Auto update incomes
const updateIncomes = asyncHandler(async () => {
  const today = new Date();
  const purchases = await Purchase.find();

  for (let purchase of purchases) {
    const createdAt = new Date(purchase.createdAt);
    const daysPassed = Math.floor((today - createdAt) / (1000 * 60 * 60 * 24));

    if (purchase.claimType === "Weekly") {
  if (daysPassed > 0 && daysPassed <= 90 && daysPassed % 5 === 0) {
    purchase.totalIncome += purchase.dailyIncome;
  }
} else if (purchase.claimType === "Monthly") {
  if (daysPassed > 0 && daysPassed <= 90 && daysPassed % 30 === 0) {
    purchase.totalIncome += purchase.dailyIncome;
  }
} else if (purchase.claimType === "90Day") {
  if (daysPassed > 0 && daysPassed % 90 === 0) {
    purchase.totalIncome += purchase.dailyIncome;
  }
}

    await purchase.save();
  }

  console.log("✅ Incomes updated at", today.toLocaleString());
});

module.exports = {
  savePurchase,
  getPurchases,
  getAllPurchases,
  updateIncomes,
};
