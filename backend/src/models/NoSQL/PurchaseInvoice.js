const mongoose = require('mongoose');

const purchaseInvoiceSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    vendorName: { type: String, required: true },
    invoiceNumber: { type: String, required: true },
    date: { type: Date, default: Date.now, required: true },
    dueDate: { type: Date },
    subtotal: { type: Number, required: true, min: 0 },
    taxAmount: { type: Number, default: 0, min: 0 },
    grandTotal: { type: Number, required: true, min: 0 },
    paymentStatus: { 
      type: String, 
      enum: ['PENDING', 'PAID', 'PARTIALLY_PAID'], 
      default: 'PENDING', 
      required: true 
    },
    paymentMethod: { 
      type: String, 
      enum: ['CASH', 'CHEQUE', 'BANK_TRANSFER', 'OTHER'], 
      default: 'BANK_TRANSFER' 
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('PurchaseInvoice', purchaseInvoiceSchema);
