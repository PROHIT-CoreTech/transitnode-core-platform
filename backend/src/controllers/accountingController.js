const Expense = require('../models/NoSQL/Expense');
const PurchaseInvoice = require('../models/NoSQL/PurchaseInvoice');
const BankTransaction = require('../models/NoSQL/BankTransaction');
const ShipmentLedger = require('../models/NoSQL/ShipmentLedger');
const ConsolidatedInvoice = require('../models/NoSQL/ConsolidatedInvoice');

// ==========================================
// 1. EXPENSES CRUD
// ==========================================

exports.getExpenses = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const expenses = await Expense.find({ tenantId }).sort({ date: -1 });
    res.json({ success: true, expenses });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ success: false, message: 'Server error fetching expenses' });
  }
};

exports.createExpense = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { date, category, amount, paymentMethod, paidTo, description, receiptUrl } = req.body;

    if (!category || !amount || !paidTo) {
      return res.status(400).json({ success: false, message: 'Please provide category, amount, and paidTo' });
    }

    const newExpense = new Expense({
      tenantId,
      date: date || Date.now(),
      category,
      amount,
      paymentMethod,
      paidTo,
      description,
      receiptUrl
    });

    await newExpense.save();
    res.status(201).json({ success: true, expense: newExpense });
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ success: false, message: 'Server error creating expense' });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { id } = req.params;
    const expense = await Expense.findOneAndDelete({ _id: id, tenantId });
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }
    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ success: false, message: 'Server error deleting expense' });
  }
};

// ==========================================
// 2. PURCHASES CRUD
// ==========================================

exports.getPurchases = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const purchases = await PurchaseInvoice.find({ tenantId }).sort({ date: -1 });
    res.json({ success: true, purchases });
  } catch (error) {
    console.error('Error fetching purchases:', error);
    res.status(500).json({ success: false, message: 'Server error fetching purchases' });
  }
};

exports.createPurchase = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { vendorName, invoiceNumber, date, dueDate, subtotal, taxAmount, grandTotal, paymentStatus, paymentMethod } = req.body;

    if (!vendorName || !invoiceNumber || !grandTotal) {
      return res.status(400).json({ success: false, message: 'Please provide vendor name, invoice number, and grand total' });
    }

    const newPurchase = new PurchaseInvoice({
      tenantId,
      vendorName,
      invoiceNumber,
      date: date || Date.now(),
      dueDate,
      subtotal: subtotal || grandTotal,
      taxAmount: taxAmount || 0,
      grandTotal,
      paymentStatus: paymentStatus || 'PENDING',
      paymentMethod: paymentMethod || 'BANK_TRANSFER'
    });

    await newPurchase.save();
    res.status(201).json({ success: true, purchase: newPurchase });
  } catch (error) {
    console.error('Error creating purchase:', error);
    res.status(500).json({ success: false, message: 'Server error creating purchase' });
  }
};

exports.deletePurchase = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { id } = req.params;
    const purchase = await PurchaseInvoice.findOneAndDelete({ _id: id, tenantId });
    if (!purchase) {
      return res.status(404).json({ success: false, message: 'Purchase invoice not found' });
    }
    res.json({ success: true, message: 'Purchase deleted successfully' });
  } catch (error) {
    console.error('Error deleting purchase:', error);
    res.status(500).json({ success: false, message: 'Server error deleting purchase' });
  }
};

exports.updatePurchaseStatus = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { id } = req.params;
    const { paymentStatus } = req.body;

    const purchase = await PurchaseInvoice.findOneAndUpdate(
      { _id: id, tenantId },
      { paymentStatus },
      { new: true }
    );

    if (!purchase) {
      return res.status(404).json({ success: false, message: 'Purchase invoice not found' });
    }

    res.json({ success: true, purchase });
  } catch (error) {
    console.error('Error updating purchase status:', error);
    res.status(500).json({ success: false, message: 'Server error updating purchase status' });
  }
};

// ==========================================
// 3. BANK RECONCILIATION
// ==========================================

exports.getBankTransactions = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const transactions = await BankTransaction.find({ tenantId }).sort({ date: -1 });
    res.json({ success: true, transactions });
  } catch (error) {
    console.error('Error fetching bank transactions:', error);
    res.status(500).json({ success: false, message: 'Server error fetching bank transactions' });
  }
};

exports.importBankTransactions = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { transactions } = req.body;

    if (!Array.isArray(transactions) || transactions.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or empty transactions list' });
    }

    const prepared = transactions.map((t) => ({
      tenantId,
      date: new Date(t.date || Date.now()),
      description: t.description || 'Bank transaction',
      refNo: t.refNo || '',
      amount: Number(t.amount) || 0,
      balance: Number(t.balance) || 0,
      status: 'UNMATCHED'
    }));

    const inserted = await BankTransaction.insertMany(prepared);
    res.status(201).json({ success: true, count: inserted.length, transactions: inserted });
  } catch (error) {
    console.error('Error importing bank transactions:', error);
    res.status(500).json({ success: false, message: 'Server error importing bank transactions' });
  }
};

exports.matchTransaction = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { transactionId, invoiceId, invoiceType } = req.body;

    if (!transactionId || !invoiceId || !invoiceType) {
      return res.status(400).json({ success: false, message: 'Provide transactionId, invoiceId, and invoiceType' });
    }

    // Find and verify transaction
    const transaction = await BankTransaction.findOne({ _id: transactionId, tenantId });
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Bank transaction not found' });
    }

    if (invoiceType === 'DAILY_LR') {
      const shipment = await ShipmentLedger.findOne({ _id: invoiceId, tenantId });
      if (!shipment) {
        return res.status(404).json({ success: false, message: 'Shipment not found' });
      }

      shipment.accounting.paymentStatus = 'PAID';
      shipment.accounting.paymentMethod = transaction.description || 'BANK_TRANSFER';
      shipment.accounting.chequeNeftNo = transaction.refNo || shipment.accounting.chequeNeftNo;
      await shipment.save();

      transaction.status = 'MATCHED';
      transaction.matchedInvoiceType = 'DAILY_LR';
      transaction.matchedInvoiceId = shipment._id;
      await transaction.save();

    } else if (invoiceType === 'CONSOLIDATED') {
      const consInvoice = await ConsolidatedInvoice.findOne({ _id: invoiceId, tenantId });
      if (!consInvoice) {
        return res.status(404).json({ success: false, message: 'Consolidated Invoice not found' });
      }

      consInvoice.status = 'PAID';
      consInvoice.paymentMethod = transaction.description || 'BANK_TRANSFER';
      consInvoice.settledAt = transaction.date;
      await consInvoice.save();

      // Settle all related shipments
      await ShipmentLedger.updateMany(
        { _id: { $in: consInvoice.shipmentIds }, tenantId },
        { 
          $set: { 
            'accounting.paymentStatus': 'PAID',
            'accounting.paymentMethod': transaction.description || 'BANK_TRANSFER'
          } 
        }
      );

      transaction.status = 'MATCHED';
      transaction.matchedInvoiceType = 'CONSOLIDATED';
      transaction.matchedInvoiceId = consInvoice._id;
      await transaction.save();

    } else {
      return res.status(400).json({ success: false, message: 'Invalid invoiceType' });
    }

    res.json({ success: true, transaction });
  } catch (error) {
    console.error('Error matching transaction:', error);
    res.status(500).json({ success: false, message: 'Server error matching transaction' });
  }
};

// ==========================================
// 4. OUTSTANDING REPORTS
// ==========================================

exports.getOutstandingReport = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;

    // Auto-migrate legacy settled credit shipments from PAID to PENDING outstanding status
    await ShipmentLedger.updateMany(
      {
        tenantId,
        'accounting.billingCycle': 'DAILY',
        'accounting.paymentStatus': 'PAID',
        'accounting.paymentType': { $in: ['CREDIT', 'FOD'] },
        'accounting.grandTotal': { $exists: true, $ne: null }
      },
      {
        $set: { 'accounting.paymentStatus': 'PENDING' }
      }
    );
    
    // Fetch pending single shipments (only settled ones, i.e., those that have subtotal/grandTotal set, but status is pending)
    const shipments = await ShipmentLedger.find({
      tenantId,
      'accounting.paymentStatus': 'PENDING',
      'accounting.billingCycle': 'DAILY',
      'accounting.grandTotal': { $exists: true, $ne: null }
    }).populate('companyId');

    // Fetch pending consolidated invoices
    const consInvoices = await ConsolidatedInvoice.find({
      tenantId,
      status: 'PENDING'
    }).populate('companyId');

    const clientReportMap = {};

    const addToClient = (clientName, amount, date) => {
      const clientKey = clientName || 'Retail Customer';
      if (!clientReportMap[clientKey]) {
        clientReportMap[clientKey] = {
          clientName: clientKey,
          totalOutstanding: 0,
          aging0to30: 0,
          aging31to60: 0,
          aging61to90: 0,
          aging90Plus: 0,
          itemsCount: 0
        };
      }

      const diffTime = Math.abs(new Date() - new Date(date));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      clientReportMap[clientKey].totalOutstanding += amount;
      clientReportMap[clientKey].itemsCount += 1;

      if (diffDays <= 30) {
        clientReportMap[clientKey].aging0to30 += amount;
      } else if (diffDays <= 60) {
        clientReportMap[clientKey].aging31to60 += amount;
      } else if (diffDays <= 90) {
        clientReportMap[clientKey].aging61to90 += amount;
      } else {
        clientReportMap[clientKey].aging90Plus += amount;
      }
    };

    // Add shipments
    shipments.forEach((s) => {
      const name = s.logistics?.receiver?.name || s.logistics?.sender?.name || 'Retail Customer';
      const amount = s.accounting?.grandTotal || 0;
      const date = s.metadata?.createdAt || Date.now();
      addToClient(name, amount, date);
    });

    // Add consolidated invoices
    consInvoices.forEach((c) => {
      const name = c.supplierName || c.companyId?.companyName || 'B2B Client';
      const amount = c.financials?.grandTotal || 0;
      const date = c.createdAt || Date.now();
      addToClient(name, amount, date);
    });

    const report = Object.values(clientReportMap);
    res.json({ success: true, report });
  } catch (error) {
    console.error('Error building outstanding report:', error);
    res.status(500).json({ success: false, message: 'Server error building outstanding report' });
  }
};

// ==========================================
// 5. PORTAL UPLOAD TRACKER
// ==========================================

exports.getBilledInvoices = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;

    // Fetch settled daily shipments
    const shipments = await ShipmentLedger.find({
      tenantId,
      'accounting.invoiceGeneratedAt': { $exists: true },
      'accounting.billingCycle': 'DAILY'
    }).populate('companyId').lean();

    // Fetch consolidated invoices
    const consInvoices = await ConsolidatedInvoice.find({
      tenantId
    }).populate('companyId').lean();

    const mappedShipments = shipments.map((s) => ({
      id: s._id,
      invoiceId: s.trackingNumber,
      clientName: s.logistics?.receiver?.name || s.logistics?.sender?.name || 'Retail Client',
      amount: s.accounting?.grandTotal || 0,
      date: s.accounting?.invoiceGeneratedAt || s.metadata?.createdAt,
      type: 'DAILY_LR',
      portalStatus: s.accounting?.portalStatus || 'NOT_UPLOADED',
      portalRefId: s.accounting?.portalRefId || '',
      portalUploadedAt: s.accounting?.portalUploadedAt || null,
      paymentStatus: s.accounting?.paymentStatus || 'PENDING'
    }));

    const mappedConsolidated = consInvoices.map((c) => ({
      id: c._id,
      invoiceId: c.invoiceId,
      clientName: c.supplierName,
      amount: c.financials?.grandTotal || 0,
      date: c.createdAt,
      type: 'CONSOLIDATED',
      portalStatus: c.portalStatus || 'NOT_UPLOADED',
      portalRefId: c.portalRefId || '',
      portalUploadedAt: c.portalUploadedAt || null,
      paymentStatus: c.status || 'PENDING'
    }));

    const billedInvoices = [...mappedShipments, ...mappedConsolidated].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    res.json({ success: true, invoices: billedInvoices });
  } catch (error) {
    console.error('Error fetching billed invoices:', error);
    res.status(500).json({ success: false, message: 'Server error fetching billed invoices' });
  }
};

exports.updatePortalStatus = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { id } = req.params;
    const { portalStatus, portalRefId } = req.body;

    if (!portalStatus) {
      return res.status(400).json({ success: false, message: 'portalStatus is required' });
    }

    // Try finding daily shipment ledger first
    let shipment = await ShipmentLedger.findOne({ _id: id, tenantId });
    if (shipment) {
      shipment.accounting.portalStatus = portalStatus;
      shipment.accounting.portalRefId = portalRefId || '';
      if (portalStatus === 'UPLOADED') {
        shipment.accounting.portalUploadedAt = new Date();
      }
      shipment.markModified('accounting');
      await shipment.save();
      return res.json({ success: true, message: 'Shipment portal status updated successfully', item: shipment });
    }

    // Try finding consolidated invoice
    let consInvoice = await ConsolidatedInvoice.findOne({ _id: id, tenantId });
    if (consInvoice) {
      consInvoice.portalStatus = portalStatus;
      consInvoice.portalRefId = portalRefId || '';
      if (portalStatus === 'UPLOADED') {
        consInvoice.portalUploadedAt = new Date();
      }
      await consInvoice.save();
      return res.json({ success: true, message: 'Master invoice portal status updated successfully', item: consInvoice });
    }

    res.status(404).json({ success: false, message: 'Invoice / Shipment not found' });
  } catch (error) {
    console.error('Error updating portal status:', error);
    res.status(500).json({ success: false, message: 'Server error updating portal status' });
  }
};

exports.getUnpaidReceivables = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;

    // Fetch settled daily shipments that are pending payment
    const shipments = await ShipmentLedger.find({
      tenantId,
      'accounting.paymentStatus': 'PENDING',
      'accounting.billingCycle': 'DAILY',
      'accounting.grandTotal': { $exists: true, $ne: null }
    }).populate('companyId').lean();

    const mappedShipments = shipments.map((s) => ({
      id: s._id,
      label: s.trackingNumber,
      client: s.logistics?.receiver?.name || s.logistics?.sender?.name || 'Retail Client',
      amount: s.accounting?.grandTotal || 0,
      date: s.metadata?.createdAt,
      type: 'DAILY_LR'
    }));

    res.json({ success: true, receivables: mappedShipments });
  } catch (error) {
    console.error('Error fetching unpaid receivables:', error);
    res.status(500).json({ success: false, message: 'Server error fetching unpaid receivables' });
  }
};
