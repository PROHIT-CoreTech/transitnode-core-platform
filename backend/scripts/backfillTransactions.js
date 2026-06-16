const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Tenant = require('../src/models/NoSQL/Tenant');
const SubscriptionTransaction = require('../src/models/NoSQL/SubscriptionTransaction');

const backfill = async () => {
  try {
    console.log('Connecting to MongoDB...', process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    
    // First, clear out any previous backfilled transactions to avoid duplicates
    await SubscriptionTransaction.deleteMany({ paymentMethod: 'backfill' });
    console.log('Cleared old backfill transactions.');

    // Find all paid or active tenants
    const tenants = await Tenant.find({});
    let count = 0;
    
    for (const tenant of tenants) {
      if (tenant.planType !== 'TRIAL') {
        let amount = 0;
        
        // Correct pricing based on the landing page
        if (tenant.planType === 'PLATINUM') amount = 100000; // 1.00L
        else if (tenant.planType === 'SILVER') amount = 50000; // 50k
        else if (tenant.planType === 'LIFETIME') amount = 500000; // 5.00L
        
        await SubscriptionTransaction.create({
          tenantId: tenant._id,
          planType: tenant.planType,
          amount: amount,
          paymentMethod: 'backfill',
          createdAt: tenant.createdAt
        });
        count++;
      }
    }
    console.log(`Successfully backfilled ${count} transactions with correct amounts!`);
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
};
backfill();
