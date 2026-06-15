const mongoose = require('mongoose');
const Tenant = require('./src/models/NoSQL/Tenant');
require('dotenv').config();

async function check() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const tenant = await Tenant.findOne({ customSubdomain: 'legacy' });
    console.log('Legacy tenant:', tenant);
  } catch (error) {
    console.error(error);
  } finally {
    process.exit();
  }
}

check();
