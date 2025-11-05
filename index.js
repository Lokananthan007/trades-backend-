const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const cors = require("cors");
const cron = require("node-cron");
const { updateIncomes } = require("./controllers/purchaseController");

dotenv.config(); // ✅ Make sure this runs BEFORE using process.env

const app = express();

// ✅ Middleware
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());

// ✅ Connect MongoDB
connectDB();

// ✅ Routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/qr", require("./routes/qrRoutes"));
app.use("/api/purchases", require("./routes/purchaseRoutes"));
app.use("/api/claims", require("./routes/claimRoutes"));

// ✅ Static uploads folder
app.use("/uploads", express.static("uploads"));

// ✅ CRON job (daily at midnight)
cron.schedule(
  "0 0 * * *",
  async () => {
    console.log("⏰ Running daily income update...");
    await updateIncomes();
  },
  { timezone: "Asia/Kolkata" }
);

// ✅ Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
