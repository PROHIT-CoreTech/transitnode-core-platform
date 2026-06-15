const mongoose = require('mongoose');
const Tenant = require('../src/models/NoSQL/Tenant');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB. Migrating URLs...');
    
    const tenants = await Tenant.find({});
    let count = 0;
    
    for (const tenant of tenants) {
      if (!tenant.fullLoginUrl) {
        tenant.fullLoginUrl = `http://${tenant.customSubdomain}.localhost:3001/login`;
        await tenant.save();
        count++;
      }
    }
    
    console.log(`Successfully migrated ${count} tenants with their fullLoginUrl.`);
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit();
  }
}

migrate();
