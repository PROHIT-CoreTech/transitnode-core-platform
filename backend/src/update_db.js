require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const ShipmentLedger = require('./models/NoSQL/ShipmentLedger');

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Connected to MongoDB");
    const result = await ShipmentLedger.updateMany(
      { 
        'logistics.receiver.name': 'Flipkart India Private Limited', 
        'accounting.billingCycle': 'MONTHLY',
        'accounting.paymentStatus': 'PENDING',
        'accounting.consolidatedInvoiceId': { $exists: false }
      },
      { 
        $set: { 
          'accounting.baseRateApplied': 47000,
          'accounting.subtotal': 47000 
        } 
      }
    );
    console.log("Updated Flipkart Shipments:", result.modifiedCount);
  } catch(e) {
    console.error(e);
  } finally {
    process.exit();
  }
}
run();
