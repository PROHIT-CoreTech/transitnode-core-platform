const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    date: { type: Date, default: Date.now, required: true },
    category: { 
      type: String, 
      enum: ['FUEL', 'OFFICE_EXPENSE', 'PETTY_CASH', 'MAINTENANCE', 'UTILITIES', 'OTHER'], 
      default: 'OTHER', 
      required: true 
    },
    amount: { type: Number, required: true, min: 0 },
    paymentMethod: { 
      type: String, 
      enum: ['CASH', 'CHEQUE', 'BANK_TRANSFER', 'OTHER'], 
      default: 'CASH' 
    },
    paidTo: { type: String, required: true },
    description: { type: String },
    receiptUrl: { type: String }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Expense', expenseSchema);
