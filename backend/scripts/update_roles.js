const path = require('path');
const mongoose = require('mongoose');
const User = require('../src/models/NoSQL/User');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function updateRoles() {
  try {
    if (!process.env.MONGO_URI) {
      console.error('Error: MONGO_URI is not defined in .env');
      process.exit(1);
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    const result = await User.updateMany(
      { role: 'RECEPTIONIST' },
      { $set: { role: 'OPERATION' } }
    );
    
    console.log(`Successfully updated ${result.modifiedCount} existing users from RECEPTIONIST to OPERATION.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

updateRoles();
