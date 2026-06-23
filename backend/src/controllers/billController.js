const ShipmentLedger = require('../models/NoSQL/ShipmentLedger');
const Tenant = require('../models/NoSQL/Tenant');
const Company = require('../models/NoSQL/Company');
const crypto = require('crypto');
const exceljs = require('exceljs');
const fs = require('fs');
const path = require('path');
const { PDFDocument, rgb } = require('pdf-lib');

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
    let invoices = await ShipmentLedger.find({ 
      'accounting.invoiceGeneratedAt': { $exists: false },
      'accounting.billingCycle': 'DAILY',
      'accounting.consolidatedInvoiceId': { $exists: false }
    }).populate('companyId').sort({ 'metadata.createdAt': -1 }).lean();
    
    const Supplier = require('../models/NoSQL/Supplier');
    invoices = await Promise.all(invoices.map(async (inv) => {
      if (inv.logistics?.receiver?.name) {
        const sup = await Supplier.findOne({ tenantId: req.user.tenantId, supplierName: inv.logistics.receiver.name }).lean();
        if (sup) {
          inv.supplierDetails = {
            address: sup.address,
            gstin: sup.gstin,
            pan: sup.pan
          };
        }
      }
      return inv;
    }));
    
    res.status(200).json({ invoices });
  } catch (error) {
    console.error('Error fetching pending invoices:', error);
    res.status(500).json({ message: 'Server error fetching invoices' });
  }
};

exports.settleInvoice = async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    
    // Log the request payload for debugging
    fs.appendFileSync(
      path.join(__dirname, '../../error.log'),
      `[DEBUG] settleInvoice called for trackingNumber: ${trackingNumber}, body: ${JSON.stringify(req.body)}\n`
    );

    const { 
      baseFreightRate, 
      driverAdvanceCash, 
      fuelVoucherAmount, 
      tollAllowance, 
      rcmApplied,
      gstAmount, 
      grandTotalToClient, 
      paymentMethod,
      
      processingCharge,
      fuelSurcharge,
      rovCharge,
      fodCharge,
      handlingCharge,
      codDodCharge,
      specialDeliveryCharge,
      otherCharges,
      paymentType,
      modeOfPayment,
      chequeNeftNo,
      bankName
    } = req.body;

    const baseFreightRateNum = Number(baseFreightRate) || 0;
    const driverAdvanceCashNum = Number(driverAdvanceCash) || 0;
    const fuelVoucherAmountNum = Number(fuelVoucherAmount) || 0;
    const tollAllowanceNum = Number(tollAllowance) || 0;
    const gstAmountNum = Number(gstAmount) || 0;
    const grandTotalToClientNum = Number(grandTotalToClient) || 0;

    // Validate that financial values are not negative
    if (baseFreightRateNum < 0 || driverAdvanceCashNum < 0 || fuelVoucherAmountNum < 0 || tollAllowanceNum < 0 || gstAmountNum < 0 || grandTotalToClientNum < 0) {
      fs.appendFileSync(
        path.join(__dirname, '../../error.log'),
        `[WARNING] Financial values validation failed: baseFreightRate=${baseFreightRateNum}, driverAdvanceCash=${driverAdvanceCashNum}, fuelVoucherAmount=${fuelVoucherAmountNum}, tollAllowance=${tollAllowanceNum}, gstAmount=${gstAmountNum}, grandTotalToClient=${grandTotalToClientNum}\n`
      );
      return res.status(400).json({ message: 'Financial values cannot be negative' });
    }

    const shipment = await ShipmentLedger.findOne({ trackingNumber });
    if (!shipment) {
      fs.appendFileSync(
        path.join(__dirname, '../../error.log'),
        `[ERROR] Shipment not found: ${trackingNumber}\n`
      );
      return res.status(404).json({ message: 'Shipment not found' });
    }

    // Defensive check to initialize accounting if missing
    if (!shipment.accounting) {
      shipment.accounting = {
        paymentStatus: 'PENDING',
        billingCycle: 'DAILY'
      };
    }

    if (shipment.accounting.paymentStatus === 'PAID') {
      fs.appendFileSync(
        path.join(__dirname, '../../error.log'),
        `[ERROR] Invoice already settled: ${trackingNumber}\n`
      );
      return res.status(400).json({ message: 'Invoice already settled' });
    }

    // Update the ledger document (We no longer override status if already IN_TRANSIT)
    if (shipment.status === 'PENDING') {
      shipment.status = 'READY_FOR_DISPATCH';
    }
    
    // Save base logic inside accounting
    shipment.accounting.accountantId = req.user?.userId || req.user?.id;
    shipment.accounting.baseRateApplied = baseFreightRateNum;
    shipment.accounting.driverAdvanceCash = driverAdvanceCashNum;
    shipment.accounting.fuelVoucherAmount = fuelVoucherAmountNum;
    shipment.accounting.tollAllowance = tollAllowanceNum;
    
    // Save LR Specific Charges & Payments
    shipment.accounting.processingCharge = Number(processingCharge) || 0;
    shipment.accounting.fuelSurcharge = Number(fuelSurcharge) || 0;
    shipment.accounting.rovCharge = Number(rovCharge) || 0;
    shipment.accounting.fodCharge = Number(fodCharge) || 0;
    shipment.accounting.handlingCharge = Number(handlingCharge) || 0;
    shipment.accounting.codDodCharge = Number(codDodCharge) || 0;
    shipment.accounting.specialDeliveryCharge = Number(specialDeliveryCharge) || 0;
    shipment.accounting.otherCharges = Number(otherCharges) || 0;
    
    shipment.accounting.paymentType = paymentType || 'CREDIT';
    shipment.accounting.modeOfPayment = modeOfPayment || 'NEFT_RTGS';
    shipment.accounting.chequeNeftNo = chequeNeftNo || '';
    shipment.accounting.bankName = bankName || '';
    
    shipment.accounting.subtotal = baseFreightRateNum; // Or derived if needed
    
    shipment.accounting.tax = {
      gstPercentage: rcmApplied ? 5 : 18,
      gstAmount: gstAmountNum,
      rcmApplied: Boolean(rcmApplied)
    };
    
    shipment.accounting.grandTotal = grandTotalToClientNum;
    shipment.accounting.paymentStatus = (paymentType === 'PAID') ? 'PAID' : 'PENDING';
    shipment.accounting.paymentMethod = paymentMethod || 'SYSTEM'; 
    shipment.accounting.invoiceGeneratedAt = new Date();

    shipment.markModified('accounting');

    if (!shipment.publicTrackingToken) {
      shipment.publicTrackingToken = crypto.randomBytes(16).toString('hex');
    }

    await shipment.save();

    fs.appendFileSync(
      path.join(__dirname, '../../error.log'),
      `[SUCCESS] Freight invoice settled successfully: ${trackingNumber}\n`
    );

    res.status(200).json({ message: 'Freight invoice settled successfully', shipment });
  } catch (error) {
    console.error('Error settling freight invoice:', error);
    fs.appendFileSync(
      path.join(__dirname, '../../error.log'),
      `[EXCEPTION] Error settling freight invoice: ${error.message}\nStack: ${error.stack}\n`
    );
    res.status(500).json({ message: 'Server error settling invoice' });
  }
};

exports.generatePdf = async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    const shipment = await ShipmentLedger.findOne({ trackingNumber });
    if (!shipment) return res.status(404).json({ message: 'Shipment not found' });

    let templatePath = null;

    if (shipment.companyId) {
      const company = await Company.findById(shipment.companyId);
      if (company && company.customInvoiceTemplateUrl) {
        templatePath = path.join(__dirname, '../../', company.customInvoiceTemplateUrl);
      }
    } 
    
    // Fallback: Look up by sender name for legacy shipments that didn't record companyId
    if (!templatePath && shipment.logistics?.sender?.name) {
      const company = await Company.findOne({ 
        tenantId: shipment.tenantId, 
        companyName: shipment.logistics.sender.name 
      });
      if (company && company.customInvoiceTemplateUrl) {
        templatePath = path.join(__dirname, '../../', company.customInvoiceTemplateUrl);
      }
    }

    if (!templatePath) {
      const tenant = await Tenant.findById(shipment.tenantId);
      if (tenant && tenant.customInvoiceTemplateUrl) {
        templatePath = path.join(__dirname, '../../', tenant.customInvoiceTemplateUrl);
      }
    }

    if (!templatePath || !fs.existsSync(templatePath)) {
      return res.status(404).json({ message: 'Custom invoice template not found for this workspace' });
    }

    const existingPdfBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    // --- SMART ALIGNMENT FOR SARTHAK ENTERPRISES TEMPLATE ---
    // The template has a specific tabular structure. We'll map coordinates into those table cells.
    const fontSize = 10;
    const textColor = rgb(0.1, 0.1, 0.1);

    // 1. Top Section Details (Tax Invoice No, Date)
    firstPage.drawText(shipment.trackingNumber || '', { x: 150, y: 665, size: fontSize, color: textColor });
    firstPage.drawText(new Date().toLocaleDateString(), { x: 150, y: 650, size: fontSize, color: textColor });

    // 2. Particulars Section (Large empty box in middle)
    const startY = 500;
    firstPage.drawText(`Logistics Services - Freight Transport`, { x: 150, y: startY, size: 11, color: textColor });
    firstPage.drawText(`Tracking Number: ${shipment.trackingNumber}`, { x: 150, y: startY - 15, size: fontSize, color: textColor });
    firstPage.drawText(`Origin: ${shipment.logistics?.transport?.origin || 'N/A'}`, { x: 150, y: startY - 30, size: fontSize, color: textColor });
    firstPage.drawText(`Destination: ${shipment.logistics?.transport?.destination || 'N/A'}`, { x: 150, y: startY - 45, size: fontSize, color: textColor });
    firstPage.drawText(`Consignor: ${shipment.logistics?.sender?.name || 'N/A'}`, { x: 150, y: startY - 65, size: fontSize, color: textColor });
    firstPage.drawText(`Consignee: ${shipment.logistics?.receiver?.name || 'N/A'}`, { x: 150, y: startY - 80, size: fontSize, color: textColor });

    // Base Amount in the right column
    if (shipment.accounting) {
      const baseAmount = shipment.accounting.subtotal || shipment.accounting.baseRateApplied || 0;
      firstPage.drawText(`${baseAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}`, { x: 450, y: startY, size: fontSize, color: textColor });

      // 3. Totals Section (Bottom right table)
      // "Net Amount Rs."
      firstPage.drawText(`${baseAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}`, { x: 450, y: 280, size: fontSize, color: textColor });
      
      // CGST & SGST
      const taxAmount = shipment.accounting.tax?.gstAmount || 0;
      const splitTax = taxAmount / 2;
      firstPage.drawText(`${splitTax.toLocaleString('en-IN', {minimumFractionDigits: 2})}`, { x: 450, y: 265, size: fontSize, color: textColor });
      firstPage.drawText(`${splitTax.toLocaleString('en-IN', {minimumFractionDigits: 2})}`, { x: 450, y: 250, size: fontSize, color: textColor });

      // "Gross Total Amt. Rs."
      const grandTotal = shipment.accounting.grandTotal || 0;
      firstPage.drawText(`${grandTotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}`, { x: 450, y: 235, size: 12, color: rgb(0, 0, 0) });
    }

    const pdfBytes = await pdfDoc.save();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="invoice_${shipment.trackingNumber}.pdf"`);
    res.send(Buffer.from(pdfBytes));

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ message: 'Server error generating PDF' });
  }
};

  exports.markAsMonthly = async (req, res) => {
    try {
      const { trackingNumber } = req.params;
      const { baseRateApplied } = req.body;
      
      // Let's log some debug details
      fs.appendFileSync(
        path.join(__dirname, '../../error.log'),
        `[DEBUG] markAsMonthly called for trackingNumber: ${trackingNumber}, baseRateApplied: ${baseRateApplied}\n`
      );

      const shipment = await ShipmentLedger.findOne({ trackingNumber });
      if (!shipment) {
        fs.appendFileSync(
          path.join(__dirname, '../../error.log'),
          `[ERROR] Shipment not found for trackingNumber: ${trackingNumber}\n`
        );
        return res.status(404).json({ message: 'Shipment not found' });
      }
      
      if (shipment.accounting.paymentStatus === 'PAID') {
        fs.appendFileSync(
          path.join(__dirname, '../../error.log'),
          `[ERROR] Shipment already PAID for trackingNumber: ${trackingNumber}\n`
        );
        return res.status(400).json({ message: 'Already paid' });
      }
  
      shipment.accounting.billingCycle = 'MONTHLY';
      if (baseRateApplied !== undefined) {
        shipment.accounting.baseRateApplied = baseRateApplied;
        shipment.accounting.subtotal = baseRateApplied;
      }
      await shipment.save();

      fs.appendFileSync(
        path.join(__dirname, '../../error.log'),
        `[SUCCESS] Shipment flagged for EOM: ${trackingNumber}\n`
      );

      res.status(200).json({ message: 'Shipment flagged for end-of-month billing' });
    } catch (error) {
      console.error('Error marking as monthly:', error);
      fs.appendFileSync(
        path.join(__dirname, '../../error.log'),
        `[EXCEPTION] Error marking as monthly: ${error.message}\nStack: ${error.stack}\n`
      );
      res.status(500).json({ message: 'Server error marking shipment as monthly' });
    }
  };

exports.getPendingMonthlyBySupplier = async (req, res) => {
  try {
    const Tenant = require('../models/NoSQL/Tenant');
    const tenant = await Tenant.findById(req.user.tenantId).lean();
    const mainHqName = tenant ? `${tenant.companyName} (Main HQ)` : 'Main HQ';

    const shipments = await ShipmentLedger.find({
      tenantId: req.user.tenantId,
      'accounting.paymentStatus': 'PENDING',
      'accounting.billingCycle': 'MONTHLY',
      'accounting.consolidatedInvoiceId': { $exists: false }
    }).populate('companyId');

    // Group by Supplier Name (logistics.receiver.name) AND Company (companyId._id)
    const grouped = {};
    shipments.forEach(s => {
      const supplier = s.logistics?.receiver?.name || 'Unknown Supplier';
      const companyIdStr = s.companyId ? s.companyId._id.toString() : 'MAIN_HQ';
      const key = `${supplier}_||_${companyIdStr}`;
      if (!grouped[key]) {
        grouped[key] = {
          supplierName: supplier,
          company: s.companyId ? s.companyId : {
            _id: req.user.tenantId,
            companyName: mainHqName,
            isMainTenant: true,
            address: tenant ? tenant.address : '',
            gstin: tenant ? tenant.gstin : '',
            pan: tenant ? tenant.pan : ''
          },
          shipmentCount: 0,
          estimatedSubtotal: 0
        };
      }
      grouped[key].shipmentCount += 1;
      // Estimate value based on baseRateApplied or fallback
      grouped[key].estimatedSubtotal += (s.accounting?.baseRateApplied || s.accounting?.subtotal || 0);
    });

    const Supplier = require('../models/NoSQL/Supplier');
    const result = Object.values(grouped);
    
    for (let r of result) {
      const sup = await Supplier.findOne({ tenantId: req.user.tenantId, supplierName: r.supplierName });
      if (sup) {
        r.address = sup.address;
        r.gstin = sup.gstin;
        r.pan = sup.pan;
      } else {
        r.address = '';
        r.gstin = '';
        r.pan = '';
      }
    }

    res.status(200).json({ suppliers: result });
  } catch (error) {
    console.error('Error grouping monthly shipments:', error);
    res.status(500).json({ message: 'Server error grouping monthly shipments' });
  }
};

exports.createConsolidatedInvoice = async (req, res) => {
  try {
    const { supplierName, companyId, taxPercentage, overrideSubtotal } = req.body;
    if (!supplierName) {
      return res.status(400).json({ message: 'Supplier name is required' });
    }

    // Find all unbilled MONTHLY shipments for this supplier and company
    const query = {
      tenantId: req.user.tenantId,
      'logistics.receiver.name': supplierName,
      'accounting.paymentStatus': 'PENDING',
      'accounting.billingCycle': 'MONTHLY',
      'accounting.consolidatedInvoiceId': { $exists: false }
    };
    
    if (companyId) {
      if (companyId.toString() === req.user.tenantId.toString()) {
        // Main HQ shipments can have companyId as null or explicitly the tenantId
        query.$or = [
          { companyId: null },
          { companyId: req.user.tenantId }
        ];
      } else {
        query.companyId = companyId;
      }
    }
    
    const shipments = await ShipmentLedger.find(query);

    if (shipments.length === 0) {
      return res.status(400).json({ message: 'No unbilled monthly shipments found for this supplier' });
    }

    let subtotal = 0;
    if (overrideSubtotal !== undefined) {
      subtotal = Number(overrideSubtotal);
    } else {
      for (const shipment of shipments) {
        subtotal += shipment.accounting.subtotal || shipment.accounting.baseRateApplied || 0;
      }
    }

    const taxAmount = subtotal * ((taxPercentage || 18) / 100);
    const grandTotal = subtotal + taxAmount;

    const invoiceId = 'MI-' + new Date().getFullYear() + '-' + Math.floor(10000 + Math.random() * 90000);

    const ConsolidatedInvoice = require('../models/NoSQL/ConsolidatedInvoice');
    const newInvoice = await ConsolidatedInvoice.create({
      invoiceId,
      tenantId: req.user.tenantId,
      companyId: (companyId && companyId.toString() !== req.user.tenantId.toString()) ? companyId : null,
      supplierName,
      shipmentIds: shipments.map(s => s._id),
      financials: { subtotal, taxAmount, grandTotal },
      status: 'PENDING',
      generatedBy: req.user.userId
    });

    let sumOfOriginalSubtotals = 0;
    for (const s of shipments) {
      sumOfOriginalSubtotals += (s.accounting.subtotal || s.accounting.baseRateApplied || 0);
    }
    const proRataFactor = sumOfOriginalSubtotals > 0 ? (grandTotal / sumOfOriginalSubtotals) : 0;

    const bulkOps = shipments.map(s => {
      const origSub = s.accounting.subtotal || s.accounting.baseRateApplied || 0;
      return {
        updateOne: {
          filter: { _id: s._id },
          update: { 
            $set: { 
              'accounting.consolidatedInvoiceId': newInvoice._id,
              'accounting.grandTotal': origSub * proRataFactor 
            } 
          }
        }
      };
    });
    
    if (bulkOps.length > 0) {
      await ShipmentLedger.bulkWrite(bulkOps);
    }

    res.status(201).json({ message: 'Consolidated Invoice generated', invoice: newInvoice });
  } catch (error) {
    console.error('Error creating consolidated invoice:', error);
    res.status(500).json({ message: 'Server error generating consolidated invoice' });
  }
};

exports.getConsolidatedInvoices = async (req, res) => {
  try {
    const ConsolidatedInvoice = require('../models/NoSQL/ConsolidatedInvoice');
    const Supplier = require('../models/NoSQL/Supplier');
    const invoices = await ConsolidatedInvoice.find({
      tenantId: req.user.tenantId
    }).populate('companyId').sort({ createdAt: -1 }).lean();
    
    const Tenant = require('../models/NoSQL/Tenant');
    const tenant = await Tenant.findById(req.user.tenantId).lean();
    const mainHqName = tenant ? `${tenant.companyName} (Main HQ)` : 'Main HQ';

    for (let inv of invoices) {
      if (!inv.companyId) {
        inv.companyId = {
          _id: req.user.tenantId,
          companyName: mainHqName,
          isMainTenant: true,
          address: tenant ? tenant.address : '',
          gstin: tenant ? tenant.gstin : '',
          pan: tenant ? tenant.pan : ''
        };
      }
      const sup = await Supplier.findOne({ tenantId: req.user.tenantId, supplierName: inv.supplierName });
      if (sup) {
        inv.supplierAddress = sup.address;
        inv.supplierGstin = sup.gstin;
        inv.supplierPan = sup.pan;
      } else {
        inv.supplierAddress = '';
        inv.supplierGstin = '';
        inv.supplierPan = '';
      }
    }

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
    const invoice = await ConsolidatedInvoice.findOne({ _id: id, tenantId: req.user.tenantId }).populate('companyId');

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
    const invoice = await ConsolidatedInvoice.findOne({ _id: id, tenantId: req.user.tenantId }).populate('companyId');

    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    const shipments = await ShipmentLedger.find({ _id: { $in: invoice.shipmentIds } });

    // Build Excel Spreadsheet using exceljs
    const workbook = new exceljs.Workbook();
    workbook.creator = 'TransitNode ERP';
    workbook.lastModifiedBy = 'TransitNode ERP';
    workbook.created = new Date();
    workbook.modified = new Date();

    const sheet = workbook.addWorksheet(`Master Invoice ${invoice.invoiceId}`);

    // 1. Title Row
    const titleRow = sheet.addRow([]);
    sheet.mergeCells('A1:N1');
    const titleCell = sheet.getCell('A1');
    
    const sortedShipments = [...shipments].sort((a, b) => new Date(a.metadata.createdAt) - new Date(b.metadata.createdAt));
    const startDateStr = sortedShipments.length > 0 ? new Date(sortedShipments[0].metadata.createdAt).toLocaleDateString('en-GB') : '';
    const endDateStr = sortedShipments.length > 0 ? new Date(sortedShipments[sortedShipments.length - 1].metadata.createdAt).toLocaleDateString('en-GB') : '';
    
    titleCell.value = `${invoice.supplierName.toUpperCase()} DETAILS FOR THE PERIOD OF ${startDateStr} to ${endDateStr}`;
    titleCell.font = { bold: true };
    titleCell.alignment = { horizontal: 'center' };

    // 2. Header Row
    const headerRow = sheet.addRow([
      'Sr. No.', 'Sales Months', 'Billing Month', 'Billing Type', 'BILL DATE', 'Invoice No.',
      'CLIENT\'S NAME', 'Bill Amount Rs.', 'TOTAL BILL AMOUNT', 'PAYMENT RECEIVED DATE',
      'RECD. AMT. RS.', 'TDS AMT.', 'Vendor Portal Status', 'Remarks'
    ]);

    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFC000' } // Excel Gold
    };
    
    headerRow.eachCell(cell => {
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' }
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    });

    // Adjust column widths
    sheet.columns.forEach((col, i) => {
      const widths = [8, 15, 15, 15, 15, 25, 35, 15, 20, 20, 15, 15, 20, 20];
      col.width = widths[i];
    });

    let sumOfOriginalSubtotals = 0;
    shipments.forEach(s => {
      sumOfOriginalSubtotals += (s.accounting?.baseRateApplied || s.accounting?.subtotal || 0);
    });

    const subtotalFactor = sumOfOriginalSubtotals > 0 ? (invoice.financials.subtotal / sumOfOriginalSubtotals) : 0;
    const taxRate = invoice.financials.subtotal > 0 ? (invoice.financials.taxAmount / invoice.financials.subtotal) : 0;

    // Add data rows
    shipments.forEach((shipment, index) => {
      const originalSubtotal = shipment.accounting?.baseRateApplied || shipment.accounting?.subtotal || 0;
      const subtotal = originalSubtotal * subtotalFactor;
      const amt = subtotal + (subtotal * taxRate);
      
      const dateObj = new Date(shipment.metadata.createdAt);
      const monthStr = dateObj.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
      const dateStr = dateObj.toLocaleDateString('en-GB');

      const row = sheet.addRow([
        index + 1,
        monthStr,
        monthStr,
        'Logistics',
        dateStr,
        shipment.trackingNumber,
        invoice.supplierName,
        subtotal,
        amt,
        '',
        '',
        '',
        '',
        ''
      ]);

      row.getCell(8).numFmt = '0.00';
      row.getCell(9).numFmt = '0.00';
      
      row.eachCell(cell => {
        cell.border = {
          top: { style: 'thin' }, left: { style: 'thin' },
          bottom: { style: 'thin' }, right: { style: 'thin' }
        };
      });
    });

    // Add Totals Row at the bottom
    const bottomTotalsRow = sheet.addRow([
      '', '', '', '', '', '', 'Total',
      { formula: `SUM(H3:H${shipments.length + 2})`, result: 0 },
      { formula: `SUM(I3:I${shipments.length + 2})`, result: 0 },
      '',
      { formula: `SUM(K3:K${shipments.length + 2})`, result: 0 },
      { formula: `SUM(L3:L${shipments.length + 2})`, result: 0 },
      '', ''
    ]);
    
    bottomTotalsRow.font = { bold: true };
    bottomTotalsRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFC000' }
    };
    bottomTotalsRow.getCell(8).numFmt = '0.00';
    bottomTotalsRow.getCell(9).numFmt = '0.00';
    bottomTotalsRow.getCell(11).numFmt = '0.00';
    bottomTotalsRow.getCell(12).numFmt = '0.00';

    bottomTotalsRow.eachCell(cell => {
      if (cell.value) {
        cell.border = {
          top: { style: 'thin' }, left: { style: 'thin' },
          bottom: { style: 'thin' }, right: { style: 'thin' }
        };
      }
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
