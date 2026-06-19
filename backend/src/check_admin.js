require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('./models/NoSQL/User');
const bcrypt = require('bcrypt');

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const admins = await User.find({ role: 'ADMIN' });
    console.log("Found ADMINs:");
    for (const admin of admins) {
      console.log(`- Email: ${admin.email}, Name: ${admin.name}, ID: ${admin._id}`);
      // Resetting password just in case
      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash('password123', salt);
      await admin.save();
    }
    console.log("Passwords reset to 'password123'");
  } catch(e) {
    console.error(e);
  } finally {
    process.exit();
  }
}
run();
