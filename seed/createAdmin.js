const dotenv = require("dotenv");
const connectDB = require("../config/db");
const Admin = require("../models/Admin");

dotenv.config();

const createAdmin = async () => {
  try {
    await connectDB();

    const existingAdmin = await Admin.findOne({ username: "admin" });
    if (existingAdmin) {
      console.log("✅ Admin already exists");
      process.exit();
    }

    const admin = new Admin({
      username: "admin",     // default username
      password: "admin123",  // will be hashed
    });

    await admin.save();
    console.log("🚀 Default admin created: username=admin, password=admin123");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

createAdmin();
