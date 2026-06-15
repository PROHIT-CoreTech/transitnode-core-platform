const mongoose = require('mongoose');

const telemetryLogSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', default: null },
  vehicleId: {
    type: String,
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['MOVING', 'STATIONARY'],
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  speed: {
    type: Number,
  },
  heading: {
    type: Number,
  },
  ignition: {
    type: Boolean,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Geospatial index for distance queries
telemetryLogSchema.index({ location: '2dsphere' });

// TTL index to automatically delete documents after 90 days (7776000 seconds)
telemetryLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });

// Multi-tenant performance index for Teltonika FMB920 tracking
telemetryLogSchema.index({ tenantId: 1, imei: 1, createdAt: -1 });

module.exports = mongoose.model('TelemetryLog', telemetryLogSchema);
