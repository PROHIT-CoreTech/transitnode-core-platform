const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
    },
    registeredMobile: {
      type: String,
      required: true,
    },
    customSubdomain: {
      type: String,
      unique: true,
      index: true,
      required: true,
    },
    fullLoginUrl: {
      type: String,
    },
    planType: {
      type: String,
      enum: ['TRIAL', 'SILVER', 'PLATINUM', 'LIFETIME'],
      default: 'TRIAL',
    },
    licenseExpiresAt: {
      type: Date,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID'],
      default: 'PENDING',
    },
    adminSetupComplete: {
      type: Boolean,
      default: false,
    },
    brandingOptions: {
      logoUrl: {
        type: String,
        default: null,
      },
      dominantHexColor: {
        type: String,
        default: '#3b82f6', // Default blue-500
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Tenant', tenantSchema);
