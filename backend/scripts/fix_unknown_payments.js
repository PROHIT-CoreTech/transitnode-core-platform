const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Tenant = require('../src/models/NoSQL/Tenant');
const SubscriptionTransaction = require('../src/models/NoSQL/SubscriptionTransaction');
const { getCashfreeOrderPayments } = require('../src/config/cashfree');

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    // Find transactions with CASHFREE_UNKNOWN
    const txs = await SubscriptionTransaction.find({ paymentMethod: 'CASHFREE_UNKNOWN' });
    console.log(`Found ${txs.length} transactions with CASHFREE_UNKNOWN.`);

    for (const tx of txs) {
      const orderId = `order_tenant_${tx.tenantId}`;
      console.log(`Checking order ${orderId} on Cashfree...`);
      try {
        const payments = await getCashfreeOrderPayments(orderId);
        const successPayment = payments && payments.find ? payments.find(p => p.payment_status === 'SUCCESS') : null;
        if (successPayment && successPayment.payment_method) {
          const method = Object.keys(successPayment.payment_method)[0] || 'unknown';
          tx.paymentMethod = `CASHFREE_${method.toUpperCase()}`;
          await tx.save();
          console.log(`Updated transaction for tenant ${tx.tenantId} to ${tx.paymentMethod}`);
        } else {
          console.log(`No success payment details found for order ${orderId}`);
        }
      } catch (cfError) {
        console.error(`Failed to update transaction ${tx._id}:`, cfError.message);
      }
    }

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
}

main();
