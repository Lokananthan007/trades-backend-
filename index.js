const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const cors = require("cors");
const cron = require("node-cron");
const { updateIncomes } = require("./controllers/purchaseController");

dotenv.config();

const app = express();

// ✅ Enable CORS for frontend (adjust domain if deploying live)
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

// ✅ Middleware
app.use(express.json());

// ✅ Connect to MongoDB
connectDB();

// ✅ Routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/qr", require("./routes/qrRoutes"));
app.use("/api/purchases", require("./routes/purchaseRoutes"));
app.use("/api/claims", require("./routes/claimRoutes"));

// ✅ Static folder (for QR uploads/images)
app.use("/uploads", express.static("uploads"));

// Runs every day at midnight (12:00 AM)
cron.schedule(
  "0 0 * * *",
  async () => {
    console.log("⏰ Running daily income update at 10:37 PM IST...");
    await updateIncomes();
  },
  { timezone: "Asia/Kolkata" }
);

// ✅ Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
