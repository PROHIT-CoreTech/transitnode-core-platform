const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Tenant = require('../src/models/NoSQL/Tenant');
const User = require('../src/models/NoSQL/User');

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    // Find the tenant for 'rohit'
    const tenant = await Tenant.findOne({ customSubdomain: 'rohit' });
    if (!tenant) {
      console.log('Tenant "rohit" not found!');
      return;
    }

    console.log(`Found Tenant: ${tenant.companyName} (${tenant._id})`);

    // Find the admin user for this tenant
    const admin = await User.findOne({ tenantId: tenant._id, role: 'ADMIN' });
    if (!admin) {
      console.log('Admin user not found for this tenant!');
      return;
    }

    const frontendDomain = process.env.FRONTEND_DOMAIN || 'localhost:3001';
    const protocol = frontendDomain.includes('localhost') ? 'http' : 'https';
    
    const magicLink = `${protocol}://${tenant.customSubdomain}.${frontendDomain}/magic-login/${admin.magicLinkToken}`;
    
    console.log('\n======================================================');
    console.log('MAGIC LOGIN DETAILS FOR TENANT "rohit":');
    console.log(`Email:        ${admin.email}`);
    console.log(`Mobile:       ${admin.mobileNumber}`);
    console.log(`Magic Link:   ${magicLink}`);
    console.log('======================================================\n');

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
}

main();
