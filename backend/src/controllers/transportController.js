const ShipmentLedger = require('../models/NoSQL/ShipmentLedger');
const Device = require('../models/NoSQL/Device');
const crypto = require('crypto');

const sendTransitSMS = async (receiverPhone, trackingUrl, publicTrackingToken) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log(`\n======================================================`);
      console.log(`[EXTERNAL SMS GATEWAY MOCK] Dispatching Tracking Link...`);
      console.log(`To: ${receiverPhone || 'Unknown'}`);
      console.log(`Message: Your cargo is dispatched and IN_TRANSIT! Track live status here: ${trackingUrl}`);
      console.log(`[DEBUG LOCAL LINK] http://sarthak.localhost:3001/tracker/${publicTrackingToken}`);
      console.log(`======================================================\n`);
      resolve(true);
    }, 500);
  });
};

exports.verifyDeliveryOtp = async (req, res) => {
  try {
    const { trackingNumber, userTypedOtp } = req.body;

    if (!trackingNumber || !userTypedOtp) {
      return res.status(400).json({ message: 'Tracking Number and OTP are required' });
    }

    const shipment = await ShipmentLedger.findOne({ trackingNumber, tenantId: req.user.tenantId, companyId: req.workspaceId });

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

    // Revert assigned vehicle to YARD and Driver to AVAILABLE
    const vehicleReg = shipment.logistics?.transport?.vehicleNumber;
    if (vehicleReg) {
      const device = await Device.findOne({ vehicleRegistration: vehicleReg, tenantId: req.user.tenantId, companyId: req.workspaceId });
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

    const driverPhone = shipment.logistics?.transport?.driverPhone;
    if (driverPhone) {
      const Driver = require('../models/NoSQL/Driver');
      await Driver.findOneAndUpdate({ phone: driverPhone, tenantId: req.user.tenantId, companyId: req.workspaceId }, { status: 'AVAILABLE' });
    }

    res.status(200).json({ message: 'OTP Verified. Cargo Unloading Authorized.', shipment });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Server error during OTP verification' });
  }
};

exports.getFleet = async (req, res) => {
  try {
    const fleet = await Device.find({ tenantId: req.user.tenantId, companyId: req.workspaceId });
    res.status(200).json({ fleet });
  } catch (error) {
    console.error('Error fetching fleet:', error);
    res.status(500).json({ message: 'Server error fetching fleet' });
  }
};

const Driver = require('../models/NoSQL/Driver');
exports.getDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find({ status: 'AVAILABLE', tenantId: req.user.tenantId, companyId: req.workspaceId });
    res.status(200).json({ drivers });
  } catch (error) {
    console.error('Error fetching drivers:', error);
    res.status(500).json({ message: 'Server error fetching drivers' });
  }
};

exports.startTrip = async (req, res) => {
  try {
    const { trackingNumber } = req.body;
    if (!trackingNumber) {
      return res.status(400).json({ message: 'Tracking number is required' });
    }

    const shipment = await ShipmentLedger.findOne({ trackingNumber, tenantId: req.user.tenantId });
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }

    if (shipment.status !== 'READY_FOR_DISPATCH') {
      return res.status(400).json({ message: 'Shipment must be READY_FOR_DISPATCH to start trip' });
    }

    // Generate public tracking token if not set
    if (!shipment.publicTrackingToken) {
      shipment.publicTrackingToken = crypto.randomBytes(16).toString('hex');
    }

    // Update shipment status
    shipment.status = 'IN_TRANSIT';
    await shipment.save();

    // Update driver status
    const driverPhone = shipment.logistics?.transport?.driverPhone;
    if (driverPhone) {
      await Driver.findOneAndUpdate(
        { phone: driverPhone, tenantId: req.user.tenantId },
        { status: 'ON_TRIP' }
      );
    }

    // Update device status if applicable
    const vehicleReg = shipment.logistics?.transport?.vehicleNumber;
    if (vehicleReg) {
      await Device.findOneAndUpdate(
        { vehicleRegistration: vehicleReg, tenantId: req.user.tenantId },
        { status: 'ON_TRIP' }
      );
    }

    // Trigger Automated Tracking Link SMS
    const trackingUrl = `https://track.transitnode.com/status/${shipment.publicTrackingToken}`;
    try {
      const receiverPhone = shipment.logistics?.receiver?.phone;
      console.log(`[DEBUG] Attempting to send tracking SMS. receiverPhone: ${receiverPhone || 'undefined'}, publicTrackingToken: ${shipment.publicTrackingToken}`);
      if (receiverPhone) {
        await sendTransitSMS(receiverPhone, trackingUrl, shipment.publicTrackingToken);
      } else {
        console.log(`[WARNING] No receiver phone number found on shipment ${shipment.trackingNumber}. Printing mock SMS to console for local testing.`);
        await sendTransitSMS('No Recipient Phone (Local Debug Mode)', trackingUrl, shipment.publicTrackingToken);
      }
    } catch (smsError) {
      console.error('Error sending Tracking SMS:', smsError);
    }

    res.status(200).json({ message: 'Trip started successfully', shipment });
  } catch (error) {
    console.error('Error starting trip:', error);
    res.status(500).json({ message: 'Server error starting trip' });
  }
};
