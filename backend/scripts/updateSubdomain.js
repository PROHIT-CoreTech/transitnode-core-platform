const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const connectDB = require('../src/config/nosql');
const Tenant = require('../src/models/NoSQL/Tenant');

async function updateSubdomain() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();

    const oldSubdomain = 'test.production';
    const newSubdomain = 'testprod';

    const tenant = await Tenant.findOne({ customSubdomain: oldSubdomain });
    if (!tenant) {
      console.log(`No tenant found with subdomain: "${oldSubdomain}"`);
      return;
    }

    tenant.customSubdomain = newSubdomain;
    await tenant.save();

    console.log(`\n======================================================`);
    console.log(`SUCCESS: Subdomain updated successfully!`);
    console.log(`Company Name: ${tenant.companyName}`);
    console.log(`Old Subdomain: ${oldSubdomain}`);
    console.log(`New Subdomain: ${newSubdomain}`);
    console.log(`======================================================\n`);

  } catch (err) {
    console.error('Error updating subdomain:', err);
  } finally {
    const mongoose = require('mongoose');
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

updateSubdomain();
