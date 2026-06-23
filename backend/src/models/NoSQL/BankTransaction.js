const mongoose = require('mongoose');

const bankTransactionSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    date: { type: Date, required: true },
    description: { type: String, required: true },
    refNo: { type: String },
    amount: { type: Number, required: true }, // Positive for deposit, negative for withdrawal
    balance: { type: Number },
    status: { 
      type: String, 
      enum: ['UNMATCHED', 'MATCHED'], 
      default: 'UNMATCHED', 
      required: true 
    },
    matchedInvoiceType: { 
      type: String, 
      enum: ['DAILY_LR', 'CONSOLIDATED'] 
    },
    matchedInvoiceId: { 
      type: mongoose.Schema.Types.ObjectId 
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('BankTransaction', bankTransactionSchema);
