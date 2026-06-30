const mongoose = require('mongoose');

const flipkartMISSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    date: { type: Date, required: true },
    sourceHubName: { type: String, required: true },
    companyName: { type: String, required: true },
    vehicleNumber: { 
      type: String, 
      required: true, 
      uppercase: true,
      trim: true
    },
    vehicleType: { type: String, required: true },
    parentVehicleNumber: { type: String, trim: true, default: '' },
    vehicleOwnershipType: { 
      type: String, 
      enum: ['Market', 'Attached', 'Owned'], 
      required: true 
    },
    driverType: { 
      type: String, 
      enum: ['Regular', 'Vendor', 'Ad-hoc'], 
      required: true 
    },
    inTime: { type: Date, required: true },
    outTime: { type: Date, required: true },
    workingHours: { type: String, required: true }, // "HH:MM"
    actualTransitTime: { type: Number, required: true }, // float hours
    manualStartOdometer: { type: Number, required: true, min: 0 }, // in meters
    manualEndOdometer: { type: Number, required: true, min: 0 }, // in meters
    manualDistanceTravelled: { type: Number, required: true, min: 0 }, // in KM
    movementType: { type: String, required: true },
    zone: { type: String, required: true },
    businessEntity: { type: String, required: true },
    vendorName: { type: String, required: true }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('FlipkartMIS', flipkartMISSchema);
