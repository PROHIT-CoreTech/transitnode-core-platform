const ShipmentLedger = require('../models/NoSQL/ShipmentLedger');
const Device = require('../models/NoSQL/Device');

exports.verifyDeliveryOtp = async (req, res) => {
  try {
    const { trackingNumber, userTypedOtp } = req.body;

    if (!trackingNumber || !userTypedOtp) {
      return res.status(400).json({ message: 'Tracking Number and OTP are required' });
    }

    const shipment = await ShipmentLedger.findOne({ trackingNumber });

    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }

    if (shipment.status === 'DELIVERED') {
      return res.status(400).json({ message: 'Shipment is already marked as DELIVERED' });
    }

    if (shipment.status !== 'ARRIVED') {
      return res.status(400).json({ message: `Shipment is currently ${shipment.status}. Must be ARRIVED to verify.` });
    }

    if (shipment.accounting?.generatedDeliveryOtp !== userTypedOtp) {
      return res.status(400).json({ message: 'Invalid OTP. Handshake failed.' });
    }

    // OTP matched! Mark as DELIVERED
    shipment.status = 'DELIVERED';
    shipment.metadata.closedAt = new Date();
    await shipment.save();

    // Revert assigned vehicle to YARD
    const vehicleReg = shipment.logistics?.transport?.vehicleNumber;
    if (vehicleReg) {
      const device = await Device.findOne({ vehicleRegistration: vehicleReg });
      if (device) {
        device.status = 'YARD';
        await device.save();

        // Broadcast dynamic map update
        const io = req.app.get('io');
        if (io) {
          io.emit('location-update', { vehicleId: vehicleReg, status: 'YARD' });
        }
      }
    }

    res.status(200).json({ message: 'OTP Verified. Cargo Unloading Authorized.', shipment });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Server error during OTP verification' });
  }
};
