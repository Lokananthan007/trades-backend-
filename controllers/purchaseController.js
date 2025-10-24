const asyncHandler = require("express-async-handler");
const Purchase = require("../models/purchase");
const User = require("../models/User");


// ✅ Helper: skip Sunday (0) and Saturday (6)
function isWeekend(date = new Date()) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

// ✅ Save new purchase
const savePurchase = asyncHandler(async (req, res) => {
  const { invest, dailyIncome, upiId, claimType, qrName } = req.body;

  if (!invest || !dailyIncome || !upiId || !claimType) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: "User not found" });

  const purchase = new Purchase({
    user: user._id,
    username: user.username,
    mobile: user.mobile,
    invest,
    dailyIncome,
    totalIncome: 0,
    withdrawn: 0,
    upiId,
    claimType,
    qrName,
  });

  const savedPurchase = await purchase.save();
  res.status(201).json(savedPurchase);
});

// ✅ Get purchases for logged-in user
const getPurchases = asyncHandler(async (req, res) => {
  const purchases = await Purchase.find({ user: req.user._id }).sort({ createdAt: -1 });
  const user = await User.findById(req.user._id).select("username mobile");
  res.json({ user, purchases });
});

// ✅ Get all purchases (admin)
const getAllPurchases = asyncHandler(async (req, res) => {
  const purchases = await Purchase.find()
    .populate("user", "username mobile")
    .sort({ createdAt: -1 });
  res.json(purchases);
});


// ✅ Automatically update daily incomes
const updateIncomes = asyncHandler(async () => {
  const today = new Date();
  console.log("🕛 Starting daily income update at", today.toLocaleString());

  const purchases = await Purchase.find();

  for (let purchase of purchases) {
    const createdAt = new Date(purchase.createdAt);
    const daysPassed = Math.floor((today - createdAt) / (1000 * 60 * 60 * 24));

    // ✅ Only update within 90 days
    if (daysPassed > 0 && daysPassed <= 90) {
      let todayIncomeAdd = 0;

      // ✅ Claim type logic
      if (purchase.claimType === "Daily") {
        todayIncomeAdd = purchase.dailyIncome;

      } else if (purchase.claimType === "Weekly") {
        if (!isWeekend(today)) {
          todayIncomeAdd = purchase.dailyIncome;
        }

      } else if (purchase.claimType === "Monthly") {
        todayIncomeAdd = purchase.dailyIncome; // can adjust later if needed
      }

      // ✅ Add dailyIncome to both todayIncome & totalIncome
      if (todayIncomeAdd > 0) {
        purchase.todayIncome += todayIncomeAdd; // cumulative daily addition
        purchase.totalIncome += todayIncomeAdd;
      }

      await purchase.save();
    } else {
      // ✅ Stop income updates after 90 days
      purchase.todayIncome = purchase.todayIncome; // keep existing, don’t add
      await purchase.save();
    }
  }

  console.log("✅ Incomes updated successfully at", today.toLocaleString());
});

module.exports = {
  savePurchase,
  getPurchases,
  getAllPurchases,
  updateIncomes,
};
