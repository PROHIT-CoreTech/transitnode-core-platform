const mongoose = require('mongoose');
require('./env_selector');
const tenantPlugin = require('../models/plugins/tenantPlugin');
const tenantGuard = require('../models/NoSQL/plugins/tenantGuard');

// Apply the logical node data isolation plugins globally
mongoose.plugin(tenantPlugin);
mongoose.plugin(tenantGuard);

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;
    const env = process.env.NODE_ENV || 'development';
    
    if (mongoUri && mongoUri.includes('.mongodb.net/')) {
      const dbNameMap = {
        localhost: 'transitnode',
        development: 'transitnode-dev',
        staging: 'transitnode-staging',
        production: 'transitnode-prod'
      };
      const dbName = dbNameMap[env] || 'transitnode';
      // Replaces the database name segment in the connection string
      mongoUri = mongoUri.replace(/\.mongodb\.net\/([^?]+)/, `.mongodb.net/${dbName}`);
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected [${env.toUpperCase()}]: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB [${process.env.NODE_ENV}]: ${error.message}`);
    process.exit(1);
  }
};

mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to DB Cluster');
});

mongoose.connection.on('error', (err) => {
  console.error(`Mongoose connection error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

module.exports = connectDB;
