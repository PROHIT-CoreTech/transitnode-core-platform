const ShipmentLedger = require('../models/NoSQL/ShipmentLedger');
const crypto = require('crypto');

// Haversine formula to calculate distance between two coordinates in meters
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in meters
};

// Mock destination coordinates for geofence validation
// In a production system, these would map from destination terminal strings to actual Lat/Lng
const getTerminalCoordinates = (cityName) => {
  // We'll mock standard coordinates for Mumbai, Delhi, etc.
  // For demo, we just return a static coordinate close to where the mock telemetry runs
  return { lat: 19.0760, lng: 72.8777 }; // Central Mumbai
};

exports.parse = (data) => {
  // Existing parser mockup
  return data;
};

exports.processGeofenceProximity = async (vehicleRegistration, currentLat, currentLng) => {
  try {
    // 1. Find an active shipment for this vehicle
    const shipment = await ShipmentLedger.findOne({
      'logistics.transport.vehicleNumber': vehicleRegistration,
      status: { $in: ['DISPATCHED', 'IN_TRANSIT'] }
    });

    if (!shipment) return; // No active trip for this vehicle

    // 2. Determine destination coordinates
    const destinationStr = shipment.logistics?.transport?.destination;
    const destCoords = getTerminalCoordinates(destinationStr);

    // 3. Calculate distance
    const distanceMeters = calculateDistance(currentLat, currentLng, destCoords.lat, destCoords.lng);

    // 4. Geofence Trigger (200 meters)
    if (distanceMeters < 200) {
      // 4a. Update status to ARRIVED
      shipment.status = 'ARRIVED';

      // 4b. Generate OTP
      const otp = crypto.randomInt(100000, 999999).toString();
      shipment.accounting = shipment.accounting || {};
      shipment.accounting.generatedDeliveryOtp = otp;

      await shipment.save();

      // 4c. Trigger Mock SMS
      const receiverPhone = shipment.logistics?.receiver?.phone;
      console.log(`\n======================================================`);
      console.log(`[EXTERNAL SMS GATEWAY MOCK] Dispatching Delivery OTP...`);
      console.log(`To: ${receiverPhone || 'Unknown'}`);
      console.log(`Message: Your cargo (Tracking: ${shipment.trackingNumber}) has arrived at the destination terminal. Share OTP: ${otp} with the Gate Clerk to authorize unloading.`);
      console.log(`======================================================\n`);
    }
  } catch (error) {
    console.error('[GEOFENCE ERROR] Failed processing proximity:', error);
  }
};
