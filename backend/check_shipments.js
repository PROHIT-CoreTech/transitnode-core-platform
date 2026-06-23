const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const ShipmentLedger = require('./src/models/NoSQL/ShipmentLedger');

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const shipments = await ShipmentLedger.find({}).lean();
    console.log(`Total Shipments in DB: ${shipments.length}`);
    shipments.forEach(s => {
      console.log(`- Tracking: ${s.trackingNumber}, Status: ${s.status}, BillingCycle: ${s.accounting?.billingCycle}, PaymentStatus: ${s.accounting?.paymentStatus}, PaymentType: ${s.accounting?.paymentType}, GrandTotal: ${s.accounting?.grandTotal}`);
    });

    const ConsolidatedInvoice = require('./src/models/NoSQL/ConsolidatedInvoice');
    const invoices = await ConsolidatedInvoice.find({}).lean();
    console.log(`Total Consolidated Invoices in DB: ${invoices.length}`);
    invoices.forEach(i => {
      console.log(`- InvoiceId: ${i.invoiceId}, Supplier: ${i.supplierName}, Status: ${i.status}, Total: ${i.financials?.grandTotal}`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
