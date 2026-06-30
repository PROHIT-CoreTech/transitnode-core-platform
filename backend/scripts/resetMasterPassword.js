const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const connectDB = require('../src/config/nosql');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../src/models/NoSQL/User');

async function resetPassword() {
  const newPassword = process.argv[2] || 'admin123';
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('Connected to MongoDB.');

    const email = 'master@transitnode.com';
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`User with email "${email}" not found!`);
      console.log('Please run the createMasterUser script first:');
      console.log('  node backend/scripts/createMasterUser.js');
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    console.log('\n--- PASSWORD RESET SUCCESSFUL ---');
    console.log(`Email (Username): ${email}`);
    console.log(`New Password:     ${newPassword}`);
    console.log('---------------------------------\n');

  } catch (err) {
    console.error('Error resetting password:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

resetPassword();
