const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Tenant = require('../src/models/NoSQL/Tenant');

const checkDb = async () => {
  try {
    console.log('Connecting to MongoDB...', process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    const count = await Tenant.countDocuments();
    const tenants = await Tenant.find({});
    console.log('Total tenants:', count);
    console.log('Tenants:', tenants.map(t => t.companyName));
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
};
checkDb();
