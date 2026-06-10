const mongoose = require('mongoose');

const complianceDocumentSchema = new mongoose.Schema(
  {
    targetType: {
      type: String,
      enum: ['VEHICLE', 'DRIVER'],
      required: true
    },
    targetId: {
      type: String,
      required: true
    },
    documentType: {
      type: String,
      enum: ['INSURANCE', 'DL', 'NATIONAL_PERMIT', 'PUC'],
      required: true
    },
    expiryDate: {
      type: Date,
      required: true
    },
    fileUrl: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Create compound index for fast lookups
complianceDocumentSchema.index({ targetType: 1, targetId: 1 });

module.exports = mongoose.model('ComplianceDocument', complianceDocumentSchema);
