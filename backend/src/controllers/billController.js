const ShipmentLedger = require('../models/NoSQL/ShipmentLedger');
const crypto = require('crypto');
const exceljs = require('exceljs');

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
      'accounting.paymentStatus': 'PENDING',
      'accounting.billingCycle': 'DAILY',
      'accounting.consolidatedInvoiceId': { $exists: false }
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

    // Update the ledger document (We no longer override status if already IN_TRANSIT)
    if (shipment.status === 'PENDING') {
      shipment.status = 'READY_FOR_DISPATCH';
    }
    
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

exports.markAsMonthly = async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    const shipment = await ShipmentLedger.findOne({ trackingNumber, tenantId: req.user.tenantId });
    if (!shipment) return res.status(404).json({ message: 'Shipment not found' });
    if (shipment.accounting.paymentStatus === 'PAID') return res.status(400).json({ message: 'Already paid' });

    shipment.accounting.billingCycle = 'MONTHLY';
    await shipment.save();

    res.status(200).json({ message: 'Shipment flagged for end-of-month billing' });
  } catch (error) {
    console.error('Error marking as monthly:', error);
    res.status(500).json({ message: 'Server error marking shipment as monthly' });
  }
};

exports.getPendingMonthlyBySupplier = async (req, res) => {
  try {
    const shipments = await ShipmentLedger.find({
      tenantId: req.user.tenantId,
      'accounting.paymentStatus': 'PENDING',
      'accounting.billingCycle': 'MONTHLY',
      'accounting.consolidatedInvoiceId': { $exists: false }
    });

    // Group by Supplier Name (logistics.receiver.name)
    const grouped = {};
    shipments.forEach(s => {
      const supplier = s.logistics?.receiver?.name || 'Unknown Supplier';
      if (!grouped[supplier]) {
        grouped[supplier] = {
          supplierName: supplier,
          shipmentCount: 0,
          estimatedSubtotal: 0
        };
      }
      grouped[supplier].shipmentCount += 1;
      // Estimate value based on baseRateApplied or fallback
      grouped[supplier].estimatedSubtotal += (s.accounting?.baseRateApplied || s.accounting?.subtotal || 0);
    });

    const result = Object.values(grouped);
    res.status(200).json({ suppliers: result });
  } catch (error) {
    console.error('Error grouping monthly shipments:', error);
    res.status(500).json({ message: 'Server error grouping monthly shipments' });
  }
};

exports.createConsolidatedInvoice = async (req, res) => {
  try {
    const { supplierName, taxPercentage } = req.body;
    if (!supplierName) {
      return res.status(400).json({ message: 'Supplier name is required' });
    }

    // Find all unbilled MONTHLY shipments for this supplier
    const shipments = await ShipmentLedger.find({
      tenantId: req.user.tenantId,
      'logistics.receiver.name': supplierName,
      'accounting.paymentStatus': 'PENDING',
      'accounting.billingCycle': 'MONTHLY',
      'accounting.consolidatedInvoiceId': { $exists: false }
    });

    if (shipments.length === 0) {
      return res.status(400).json({ message: 'No unbilled monthly shipments found for this supplier' });
    }

    let subtotal = 0;
    for (const shipment of shipments) {
      subtotal += shipment.accounting.subtotal || shipment.accounting.baseRateApplied || 0;
    }

    const taxAmount = subtotal * ((taxPercentage || 18) / 100);
    const grandTotal = subtotal + taxAmount;

    const invoiceId = 'MI-' + new Date().getFullYear() + '-' + Math.floor(10000 + Math.random() * 90000);

    const ConsolidatedInvoice = require('../models/NoSQL/ConsolidatedInvoice');
    const newInvoice = await ConsolidatedInvoice.create({
      invoiceId,
      tenantId: req.user.tenantId,
      companyId: req.workspaceId,
      supplierName,
      shipmentIds: shipments.map(s => s._id),
      financials: { subtotal, taxAmount, grandTotal },
      status: 'PENDING',
      generatedBy: req.user.userId
    });

    await ShipmentLedger.updateMany(
      { _id: { $in: shipments.map(s => s._id) } },
      { $set: { 'accounting.consolidatedInvoiceId': newInvoice._id } }
    );

    res.status(201).json({ message: 'Consolidated Invoice generated', invoice: newInvoice });
  } catch (error) {
    console.error('Error creating consolidated invoice:', error);
    res.status(500).json({ message: 'Server error generating consolidated invoice' });
  }
};

exports.getConsolidatedInvoices = async (req, res) => {
  try {
    const ConsolidatedInvoice = require('../models/NoSQL/ConsolidatedInvoice');
    const invoices = await ConsolidatedInvoice.find({
      tenantId: req.user.tenantId
    }).sort({ createdAt: -1 });
    
    res.status(200).json({ invoices });
  } catch (error) {
    console.error('Error fetching consolidated invoices:', error);
    res.status(500).json({ message: 'Server error fetching consolidated invoices' });
  }
};

exports.settleConsolidatedInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod } = req.body;

    const ConsolidatedInvoice = require('../models/NoSQL/ConsolidatedInvoice');
    const invoice = await ConsolidatedInvoice.findOne({ _id: id, tenantId: req.user.tenantId });

    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    if (invoice.status === 'PAID') return res.status(400).json({ message: 'Invoice is already paid' });

    invoice.status = 'PAID';
    invoice.paymentMethod = paymentMethod || 'SYSTEM';
    invoice.settledAt = new Date();
    await invoice.save();

    await ShipmentLedger.updateMany(
      { _id: { $in: invoice.shipmentIds } },
      { 
        $set: { 
          'accounting.paymentStatus': 'PAID',
          status: 'READY_FOR_DISPATCH'
        } 
      }
    );

    res.status(200).json({ message: 'Consolidated Invoice settled', invoice });
  } catch (error) {
    console.error('Error settling consolidated invoice:', error);
    res.status(500).json({ message: 'Server error settling consolidated invoice' });
  }
};

exports.exportConsolidatedInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const ConsolidatedInvoice = require('../models/NoSQL/ConsolidatedInvoice');
    const invoice = await ConsolidatedInvoice.findOne({ _id: id, tenantId: req.user.tenantId });

    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    const shipments = await ShipmentLedger.find({ _id: { $in: invoice.shipmentIds } });

    // Build Excel Spreadsheet using exceljs
    const workbook = new exceljs.Workbook();
    workbook.creator = 'TransitNode ERP';
    workbook.lastModifiedBy = 'TransitNode ERP';
    workbook.created = new Date();
    workbook.modified = new Date();

    const sheet = workbook.addWorksheet(`Master Invoice ${invoice.invoiceId}`);

    // Define columns
    sheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Tracking Number', key: 'tracking', width: 25 },
      { header: 'Origin', key: 'origin', width: 20 },
      { header: 'Destination', key: 'destination', width: 20 },
      { header: 'Base Freight', key: 'base', width: 15 },
      { header: 'Grand Total', key: 'total', width: 15 }
    ];

    // Style header row
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF9333EA' } // Purple-600 to match the UI Theme for Master Invoices
    };

    // Add data rows
    shipments.forEach(shipment => {
      const amt = shipment.accounting?.grandTotal || shipment.accounting?.subtotal || shipment.accounting?.baseRateApplied || 0;
      const subtotal = shipment.accounting?.subtotal || shipment.accounting?.baseRateApplied || 0;
      
      const row = sheet.addRow({
        date: new Date(shipment.metadata.createdAt).toLocaleDateString(),
        tracking: shipment.trackingNumber,
        origin: shipment.logistics?.transport?.origin || 'Unknown',
        destination: shipment.logistics?.transport?.destination || 'Unknown',
        base: subtotal,
        total: amt
      });

      row.getCell('base').alignment = { horizontal: 'right' };
      row.getCell('total').alignment = { horizontal: 'right' };
      row.getCell('base').numFmt = '0.00';
      row.getCell('total').numFmt = '0.00';
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="master_invoice_${invoice.invoiceId}.xlsx"`);

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Error exporting consolidated invoice:', error);
    res.status(500).json({ message: 'Server error generating export', error: error.message });
  }
};
