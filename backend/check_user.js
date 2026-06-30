const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const connectDB = require('./src/config/nosql');
const User = require('./src/models/NoSQL/User');
const Tenant = require('./src/models/NoSQL/Tenant');
const mongoose = require('mongoose');

async function check() {
  try {
    await connectDB();
    const user = await User.findOne({ email: 'master@transitnode.com' });
    if (user) {
      console.log('--- USER IN DB ---');
      console.log('Email:', user.email);
      console.log('TenantId:', user.tenantId);
      console.log('Role:', user.role);
      console.log('Password hash:', user.password);
      
      const tenant = await Tenant.findById(user.tenantId);
      if (tenant) {
        console.log('--- TENANT IN DB ---');
        console.log('Subdomain:', tenant.customSubdomain);
        console.log('PlanType:', tenant.planType);
      } else {
        console.log('Tenant not found for ID:', user.tenantId);
      }
    } else {
      console.log('User master@transitnode.com NOT found in DB!');
    }
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
}

check();
