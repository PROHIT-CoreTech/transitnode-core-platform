const mongoose = require('mongoose');
const ShipmentLedger = require('./backend/src/models/NoSQL/ShipmentLedger');
const ConsolidatedInvoice = require('./backend/src/models/NoSQL/ConsolidatedInvoice');
const Company = require('./backend/src/models/NoSQL/Company');

async function fix() {
  await mongoose.connect('mongodb://localhost:27017/transitnode', { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected');

  const invoices = await ConsolidatedInvoice.find().lean();
  console.log(`Found ${invoices.length} master invoices`);
  for (let inv of invoices) {
    console.log(`Invoice ${inv.invoiceId}: companyId = ${inv.companyId}`);
    if (!inv.companyId) {
       // try to fix
       const shipment = await ShipmentLedger.findById(inv.shipmentIds[0]);
       console.log(`  -> first shipment sender: ${shipment?.logistics?.sender?.name}, companyId: ${shipment?.companyId}`);
    }
  }
  
  process.exit(0);
}
fix();
