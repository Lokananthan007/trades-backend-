const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { savePurchase, getPurchases, getAllPurchases } = require("../controllers/purchaseController");

router.post("/", protect, savePurchase);
router.get("/", protect, getPurchases);
router.get("/all", getAllPurchases); // maybe admin

module.exports = router;
