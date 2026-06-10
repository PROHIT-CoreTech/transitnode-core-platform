const ShipmentLedger = require('../models/NoSQL/ShipmentLedger');
const crypto = require('crypto');

// Mock helper function to simulate external SMS gateway
const sendTransitSMS = async (receiverPhone, trackingUrl) => {
  return new Promise((resolve, reject) => {
    // Simulate network delay
    setTimeout(() => {
      console.log(`\n======================================================`);
      console.log(`[EXTERNAL SMS GATEWAY MOCK] Dispatching Tracking Link...`);
      console.log(`To: ${receiverPhone || 'Unknown'}`);
      console.log(`Message: Your freight invoice is settled and cargo is READY_FOR_DISPATCH! Track live status here: ${trackingUrl}`);
      console.log(`======================================================\n`);
      resolve(true);
    }, 500);
  });
};

exports.getPendingInvoices = async (req, res) => {
  try {
    const invoices = await ShipmentLedger.find({ 
      status: 'PENDING',
      'accounting.paymentStatus': 'PENDING' 
    }).sort({ 'metadata.createdAt': -1 });
    
    res.status(200).json({ invoices });
  } catch (error) {
    console.error('Error fetching pending invoices:', error);
    res.status(500).json({ message: 'Server error fetching invoices' });
  }
};

exports.settleInvoice = async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    const { 
      baseFreightRate, 
      driverAdvanceCash, 
      fuelVoucherAmount, 
      tollAllowance, 
      rcmApplied,
      gstAmount, 
      grandTotalToClient, 
      paymentMethod 
    } = req.body;

    // Validate that financial values are not negative
    if (baseFreightRate < 0 || driverAdvanceCash < 0 || fuelVoucherAmount < 0 || tollAllowance < 0 || gstAmount < 0 || grandTotalToClient < 0) {
      return res.status(400).json({ message: 'Financial values cannot be negative' });
    }

    const shipment = await ShipmentLedger.findOne({ trackingNumber });
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }

    if (shipment.accounting.paymentStatus === 'PAID') {
      return res.status(400).json({ message: 'Invoice already settled' });
    }

    // Update the ledger document
    shipment.status = 'READY_FOR_DISPATCH';
    
    // Save base logic inside accounting
    shipment.accounting.accountantId = req.user?.id;
    shipment.accounting.baseRateApplied = baseFreightRate;
    shipment.accounting.driverAdvanceCash = driverAdvanceCash || 0;
    shipment.accounting.fuelVoucherAmount = fuelVoucherAmount || 0;
    shipment.accounting.tollAllowance = tollAllowance || 0;
    shipment.accounting.subtotal = baseFreightRate; // Or derived if needed
    
    shipment.accounting.tax = {
      gstPercentage: rcmApplied ? 5 : 18,
      gstAmount: gstAmount,
      rcmApplied: Boolean(rcmApplied)
    };
    
    shipment.accounting.grandTotal = grandTotalToClient;
    shipment.accounting.paymentStatus = 'PAID';
    shipment.accounting.paymentMethod = paymentMethod || 'SYSTEM'; 
    shipment.accounting.invoiceGeneratedAt = new Date();

    shipment.markModified('accounting');

    if (!shipment.publicTrackingToken) {
      shipment.publicTrackingToken = crypto.randomBytes(16).toString('hex');
    }

    await shipment.save();

    // Trigger Automated Tracking Link SMS
    const trackingUrl = `https://track.transitnode.com/status/${shipment.publicTrackingToken}`;
    try {
      const receiverPhone = shipment.logistics?.receiver?.phone;
      if (receiverPhone) {
        await sendTransitSMS(receiverPhone, trackingUrl);
      }
    } catch (smsError) {
      console.error('Error sending Tracking SMS:', smsError);
      // Gracefully fail, DO NOT throw to prevent rolling back the core database invoice state write.
    }

    res.status(200).json({ message: 'Freight invoice settled successfully', shipment });
  } catch (error) {
    console.error('Error settling freight invoice:', error);
    res.status(500).json({ message: 'Server error settling invoice' });
  }
};
