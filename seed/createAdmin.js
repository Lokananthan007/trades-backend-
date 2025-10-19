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
      username: "Vicky",     // default username
      password: "Vicky@76136",  // will be hashed
    });

    await admin.save();
    console.log("🚀 Default admin created: username=Vicky, password=Vicky@76136");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

createAdmin();
