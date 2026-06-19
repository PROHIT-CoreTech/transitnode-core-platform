const fs = require('fs');
const path = './src/controllers/billController.js';
let code = fs.readFileSync(path, 'utf8');

const target = `    const invoices = await ShipmentLedger.find({ 
      'accounting.paymentStatus': 'PENDING',
      'accounting.billingCycle': 'DAILY',
      'accounting.consolidatedInvoiceId': { $exists: false }
    }).populate('companyId').sort({ 'metadata.createdAt': -1 });
    
    res.status(200).json({ invoices });`;

const replacement = `    let invoices = await ShipmentLedger.find({ 
      'accounting.paymentStatus': 'PENDING',
      'accounting.billingCycle': 'DAILY',
      'accounting.consolidatedInvoiceId': { $exists: false }
    }).populate('companyId').sort({ 'metadata.createdAt': -1 }).lean();
    
    const Supplier = require('../models/NoSQL/Supplier');
    invoices = await Promise.all(invoices.map(async (inv) => {
      if (inv.logistics?.receiver?.name) {
        const sup = await Supplier.findOne({ tenantId: req.user.tenantId, supplierName: inv.logistics.receiver.name });
        if (sup) {
          inv.supplierDetails = {
            address: sup.address,
            gstin: sup.gstin,
            pan: sup.pan
          };
        }
      }
      return inv;
    }));
    
    res.status(200).json({ invoices });`;

code = code.replace(target, replacement);
fs.writeFileSync(path, code);
console.log('Patched billController.js');
