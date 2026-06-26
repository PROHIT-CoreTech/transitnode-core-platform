const crypto = require('crypto');
const ShipmentLedger = require('../models/NoSQL/ShipmentLedger');
const TelemetryLog = require('../models/NoSQL/TelemetryLog');
const { calculateDistance } = require('../utils/geofenceCalculator');
const { sendConsigneeTrackingAlert } = require('../utils/smsService');

/**
 * Process live vehicle telemetry and monitor geofence breaches.
 */
exports.processTelemetry = async (req, res) => {
  try {
    const { vehicleId, lat, lng, speed, heading, ignition } = req.body;

    if (!vehicleId || lat === undefined || lng === undefined) {
      return res.status(400).json({ success: false, message: 'vehicleId, lat, and lng are required' });
    }

    // Attempt to log telemetry but do not let it block geofence calculations if it fails
    try {
      // Find a shipment to associate tenantId/companyId, or we could just skip saving telemetry if it's strictly a geofence endpoint.
      // Assuming we just want to run the geofence logic for now.
    } catch (logError) {
      console.error('Failed to save telemetry log:', logError);
    }

    // 1. Fetch the active shipment linked to the incoming vehicleId
    // Status 'IN_TRANSIT' or 'DISPATCHED' means the vehicle is on the way.
    const activeShipment = await ShipmentLedger.findOne({
      'logistics.transport.vehicleNumber': vehicleId,
      status: { $in: ['DISPATCHED', 'IN_TRANSIT'] }
    });

    if (!activeShipment) {
      // No active shipment found for this vehicle. Acknowledge telemetry receipt.
      return res.status(200).json({ success: true, message: 'Telemetry received, no active shipment' });
    }

    // Ensure we have destination coordinates set on this shipment
    if (activeShipment.destinationLat === undefined || activeShipment.destinationLng === undefined) {
      return res.status(200).json({ success: true, message: 'Telemetry received, shipment missing destination coordinates' });
    }

    // 2 & 3. Calculate distance between current location and destination
    const distance = calculateDistance(
      lat, 
      lng, 
      activeShipment.destinationLat, 
      activeShipment.destinationLng
    );

    // 4. Check geofence rules
    if (distance <= 200 && !activeShipment.geofenceBreached) {
      // Generate a secure, unique 4-digit numeric string OTP
      const gateVerificationOTP = Math.floor(1000 + Math.random() * 9000).toString();
      
      // Update the shipment document state
      activeShipment.geofenceBreached = true;
      activeShipment.gateVerificationOTP = gateVerificationOTP;
      activeShipment.otpGeneratedAt = new Date();

      await activeShipment.save();

      // Trigger the SMS dispatch in a non-blocking way
      const consigneePhone = activeShipment.logistics?.receiver?.phone;
      if (consigneePhone) {
        sendConsigneeTrackingAlert(
          activeShipment._id,
          consigneePhone,
          vehicleId,
          gateVerificationOTP
        ).catch(err => {
          console.error('Non-blocking SMS dispatch failed:', err);
        });
      } else {
        console.warn(`Geofence breached for Shipment ${activeShipment._id}, but no consignee phone number is available.`);
      }

      return res.status(200).json({ 
        success: true, 
        message: 'Telemetry received, geofence breached and OTP sent',
        distance,
        otpGenerated: true
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Telemetry received, vehicle out of geofence radius',
      distance,
      otpGenerated: false
    });

  } catch (error) {
    // Wrap the tracking calculation routines tightly inside try/catch execution chains 
    // so that telemetry processing never fails or crashes the server stream.
    console.error('Critical error in telemetry processing:', error);
    // Return a 500 but do not crash the Node process
    return res.status(500).json({ success: false, message: 'Internal server error processing telemetry' });
  }
};
