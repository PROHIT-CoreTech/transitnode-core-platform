const mongoose = require('mongoose');
const ConsolidatedInvoice = require('./backend/src/models/NoSQL/ConsolidatedInvoice');

async function run() {
  await mongoose.connect('mongodb://localhost:27017/transitnode', { useNewUrlParser: true, useUnifiedTopology: true });
  
  const invoices = await ConsolidatedInvoice.find({}).lean();
  console.log(`Found ${invoices.length} consolidated invoices.`);
  
  for (let inv of invoices) {
    console.log(`Invoice ${inv.invoiceId}: companyId = ${inv.companyId}`);
  }
  
  process.exit(0);
}
run();
