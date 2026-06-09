const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/NoSQL/User');
const connectDB = require('./config/nosql');

const seedUsers = async () => {
  try {
    // 1. Connect to Database
    if (!process.env.MONGO_URI) {
      console.error("ERROR: MONGO_URI is missing in your .env file!");
      process.exit(1);
    }
    await connectDB();

    // 2. Clear existing users to prevent duplicates during testing
    await User.deleteMany({});
    console.log('Cleared existing test users.');

    // 3. Hash passwords
    const salt = await bcrypt.genSalt(10);
    const defaultPassword = await bcrypt.hash('password123', salt);

    // 4. Create test users for each role
    const users = [
      {
        name: 'Alice Admin',
        email: 'admin@transitnode.com',
        password: defaultPassword,
        role: 'ADMIN',
      },
      {
        name: 'Rachel Receptionist',
        email: 'receptionist@transitnode.com',
        password: defaultPassword,
        role: 'RECEPTIONIST',
      },
      {
        name: 'Andy Accountant',
        email: 'accountant@transitnode.com',
        password: defaultPassword,
        role: 'ACCOUNTANT',
      }
    ];

    await User.insertMany(users);
    console.log('Test users created successfully!');
    console.table(users.map(u => ({ Name: u.name, Email: u.email, Role: u.role, Password: 'password123' })));

    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();
