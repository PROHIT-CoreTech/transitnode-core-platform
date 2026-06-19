const mongoose = require('mongoose');
const ConsolidatedInvoice = require('./src/models/NoSQL/ConsolidatedInvoice');
const Company = require('./src/models/NoSQL/Company');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const invoices = await ConsolidatedInvoice.find({ status: 'PENDING' }).populate('companyId');
  let fixedCount = 0;

  for (let inv of invoices) {
    if (inv.companyId) {
      const hasGst = inv.companyId.gstin && inv.companyId.gstin.trim() !== "";
      const tType = inv.companyId.invoiceTemplateType;
      const shouldBeZero = tType === 'BILL_OF_SUPPLY' || tType === 'SIMPLIFIED_3_COL' || !hasGst;
      
      if (shouldBeZero && inv.financials.taxAmount > 0) {
        inv.financials.taxAmount = 0;
        inv.financials.grandTotal = inv.financials.subtotal;
        await inv.save();
        fixedCount++;
      }
    }
  }
  
  console.log(`Fixed ${fixedCount} master invoices.`);
  process.exit(0);
}

run().catch(console.error);
