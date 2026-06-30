const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const connectDB = require('../src/config/nosql');
const mongoose = require('mongoose');

async function clearDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    
    const dbName = mongoose.connection.db.databaseName;
    console.log(`\n======================================================`);
    console.log(`TARGET DATABASE: ${dbName}`);
    console.log(`======================================================\n`);

    if (dbName !== 'transitnode-prod') {
      console.error(`ABORTED: This script is locked to database "transitnode-prod".`);
      console.error(`Currently connected database is "${dbName}".`);
      process.exit(1);
    }

    const collections = await mongoose.connection.db.collections();
    console.log(`Found ${collections.length} collections to drop.`);

    for (const collection of collections) {
      const name = collection.collectionName;
      console.log(`Dropping collection: ${name}...`);
      try {
        await collection.drop();
      } catch (err) {
        // NamespaceNotFound is fine to ignore
        if (err.codeName !== 'NamespaceNotFound') {
          throw err;
        }
      }
    }

    console.log('\n--- DATABASE CLEAR COMPLETED SUCCESSFULLY ---');
    console.log(`All collections dropped from database: ${dbName}`);
    console.log('---------------------------------------------\n');

  } catch (err) {
    console.error('Error clearing database:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

clearDatabase();
