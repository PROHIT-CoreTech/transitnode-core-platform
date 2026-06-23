const mongoose = require('mongoose');
const ShipmentLedger = require('./src/models/NoSQL/ShipmentLedger');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function run() {
  try {
    console.log("Connecting to database...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected.");
    
    const trackingNumber = 'TR-2026-32834';
    const shipment = await ShipmentLedger.findOne({ trackingNumber });
    if (!shipment) {
      console.log("Shipment not found!");
      return;
    }
    console.log("Shipment Document Structure:");
    console.log(JSON.stringify(shipment, null, 2));
    
    console.log("\n--- Testing Mongoose Validation ---");
    try {
      await shipment.validate();
      console.log("Validation check: PASSED.");
    } catch (ve) {
      console.error("Validation check: FAILED.");
      console.error(ve.message);
      console.error(JSON.stringify(ve.errors, null, 2));
    }
    
    console.log("\n--- Testing save() operation ---");
    shipment.accounting.billingCycle = 'MONTHLY';
    try {
      await shipment.save();
      console.log("Save check: PASSED.");
    } catch (se) {
      console.error("Save check: FAILED.");
      console.error(se.message);
    }
  } catch (err) {
    console.error("Unexpected error:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}
run();
