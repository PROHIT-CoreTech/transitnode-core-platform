require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const ShipmentLedger = require('./models/NoSQL/ShipmentLedger');

async function run() {
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log("Connected");
  const shipments = await ShipmentLedger.find({ 'logistics.receiver.name': 'Flipkart India Private Limited', 'accounting.billingCycle': 'MONTHLY' }).limit(5);
  console.log(JSON.stringify(shipments, null, 2));
  process.exit();
}
run();
