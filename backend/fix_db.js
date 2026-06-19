const mongoose = require('mongoose');
const ConsolidatedInvoice = require('./src/models/NoSQL/ConsolidatedInvoice');
const Company = require('./src/models/NoSQL/Company');
const ShipmentLedger = require('./src/models/NoSQL/ShipmentLedger');
require('dotenv').config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    
    const invoices = await ConsolidatedInvoice.find({});
    console.log(`Found ${invoices.length} consolidated invoices.`);
    
    let fixedCount = 0;
    for (let inv of invoices) {
      if (!inv.companyId) {
        // Try to find the companyId from its shipments
        const shipment = await ShipmentLedger.findOne({ _id: { $in: inv.shipmentIds }, companyId: { $exists: true, $ne: null } });
        if (shipment && shipment.companyId) {
          inv.companyId = shipment.companyId;
          await inv.save();
          console.log(`Fixed invoice ${inv.invoiceId} using shipment ${shipment.trackingNumber} with companyId: ${shipment.companyId}`);
          fixedCount++;
        } else {
          console.log(`Could not find companyId for invoice ${inv.invoiceId} from shipments.`);
        }
      } else {
        console.log(`Invoice ${inv.invoiceId} already has companyId: ${inv.companyId}`);
      }
    }
    console.log(`Fixed ${fixedCount} invoices.`);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
run();
