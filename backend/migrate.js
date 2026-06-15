const mongoose = require('mongoose');
const Tenant = require('./src/models/NoSQL/Tenant');
require('dotenv').config();

async function migrate() {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('Error: MONGODB_URI is not defined in the .env file!');
      process.exit(1);
    }
    await mongoose.connect(process.env.MONGODB_URI);
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
