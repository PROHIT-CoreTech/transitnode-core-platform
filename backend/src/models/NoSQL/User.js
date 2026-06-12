const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      sparse: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
    },
    role: {
      type: String,
      enum: ['RECEPTIONIST', 'ACCOUNTANT', 'ADMIN', 'DRIVER'],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    driverProfile: {
      fullName: String,
      licenseNumber: String,
      phoneNumber: String,
      assignedVehicle: String,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
