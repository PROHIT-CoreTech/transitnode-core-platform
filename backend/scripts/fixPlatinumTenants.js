const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Tenant = require('../src/models/NoSQL/Tenant');

const fixCompanies = async () => {
  try {
    console.log('Connecting to MongoDB...', process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    const result = await Tenant.updateMany(
      { planType: 'PLATINUM' },
      { $set: { maxCompaniesAllowed: 1 } }
    );
    console.log(`Modified ${result.modifiedCount} PLATINUM tenants to have maxCompaniesAllowed = 1.`);
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
};
fixCompanies();
