const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    gstin: {
      type: String,
    },
    pan: {
      type: String,
    },
    address: {
      type: String,
      required: true,
    },
    state: {
      type: String,
    },
    stateCode: {
      type: String,
    },
    contactNumber: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Company', companySchema);
