const mongoose = require('mongoose');

const consolidatedInvoiceSchema = new mongoose.Schema(
  {
    invoiceId: {
      type: String,
      required: true,
      unique: true,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      index: true,
    },
    supplierName: {
      type: String,
      required: true,
    },
    shipmentIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ShipmentLedger',
      }
    ],
    financials: {
      subtotal: {
        type: Number,
        default: 0,
      },
      taxAmount: {
        type: Number,
        default: 0,
      },
      grandTotal: {
        type: Number,
        default: 0,
      }
    },
    status: {
      type: String,
      enum: ['PENDING', 'PAID'],
      default: 'PENDING',
    },
    paymentMethod: {
      type: String,
    },
    settledAt: {
      type: Date,
    },
    portalStatus: { 
      type: String, 
      enum: ['NOT_UPLOADED', 'UPLOADED', 'DISPUTED'], 
      default: 'NOT_UPLOADED' 
    },
    portalRefId: { 
      type: String 
    },
    portalUploadedAt: { 
      type: Date 
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ConsolidatedInvoice', consolidatedInvoiceSchema);
