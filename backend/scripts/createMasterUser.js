const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const connectDB = require('../src/config/nosql');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Tenant = require('../src/models/NoSQL/Tenant');
const Company = require('../src/models/NoSQL/Company');
const User = require('../src/models/NoSQL/User');

const createMasterUser = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('Connected to MongoDB.');

    const companyName = 'Master Admin Corp';
    const email = 'master@transitnode.com';
    const mobileNumber = '9999999999';
    const passwordPlain = process.env.MASTER_USER_PASSWORD || require('crypto').randomBytes(8).toString('hex');

    // 1. Create Tenant
    const tenant = new Tenant({
      companyName,
      registeredMobile: mobileNumber,
      customSubdomain: 'masteradmin',
      planType: 'LIFETIME',
      licenseExpiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 100)), // 100 years
      adminSetupComplete: true,
      maxCompaniesAllowed: 999
    });
    await tenant.save();
    console.log(`[1] Created Tenant: ${tenant._id}`);

    // 2. Create Company
    const company = new Company({
      tenantId: tenant._id,
      companyName: companyName,
      address: 'Global HQ',
      contactNumber: mobileNumber
    });
    await company.save();
    console.log(`[2] Created Company: ${company._id}`);

    // 3. Create ADMIN User
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(passwordPlain, salt);

    const user = new User({
      tenantId: tenant._id,
      username: email,
      email,
      mobileNumber,
      password: hashedPassword,
      name: 'Master User',
      role: 'ADMIN'
    });
    await user.save();
    console.log(`[3] Created ADMIN User: ${user._id}`);
    
    console.log('\n--- MASTER USER DETAILS ---');
    console.log(`Email (Username): ${email}`);
    console.log(`Password: ${passwordPlain}`);
    console.log('---------------------------\n');

  } catch (err) {
    console.error('Error creating master user:', err);
  } finally {
    mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
};

createMasterUser();
