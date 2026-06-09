const mongoose = require('mongoose');

const shipmentLedgerSchema = new mongoose.Schema(
  {
    trackingNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'READY_FOR_DISPATCH', 'DISPATCHED', 'DELIVERED'],
      default: 'PENDING',
    },
    metadata: {
      receptionistId: { type: String },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
    },
    logistics: {
      sender: {
        name: { type: String },
        phone: { type: String },
      },
      receiver: {
        name: { type: String },
        phone: { type: String },
      },
      package: {
        weight_kg: { type: Number, min: 0 },
        dimensions: { type: String }, // e.g. "10x20x30"
      },
    },
    accounting: {
      accountantId: { type: String },
      baseRateApplied: { type: Number, min: 0 },
      subtotal: { type: Number, min: 0 },
      tax: {
        gstPercentage: { type: Number, min: 0 },
        gstAmount: { type: Number, min: 0 },
      },
      grandTotal: { type: Number, min: 0 },
      paymentStatus: {
        type: String,
        enum: ['PENDING', 'PAID'],
        default: 'PENDING',
      },
      invoiceGeneratedAt: { type: Date },
    },
  },
  {
    // Disable automatic timestamps since we are handling them in the metadata block
    timestamps: false, 
  }
);

// Compound index
shipmentLedgerSchema.index({ trackingNumber: 1, 'metadata.createdAt': -1 });

// Pre-save hook to update the updated_at metadata
shipmentLedgerSchema.pre('save', function (next) {
  this.metadata.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('ShipmentLedger', shipmentLedgerSchema);
