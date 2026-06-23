const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');
const accountingController = require('../controllers/accountingController');

// All accounting routes require verification and Accountant or Admin role
router.use(verifyToken);
router.use(checkRole(['ACCOUNTANT', 'ADMIN']));

// 1. Expenses CRUD
router.get('/expenses', accountingController.getExpenses);
router.post('/expenses', accountingController.createExpense);
router.delete('/expenses/:id', accountingController.deleteExpense);

// 2. Purchases CRUD
router.get('/purchases', accountingController.getPurchases);
router.post('/purchases', accountingController.createPurchase);
router.patch('/purchases/:id/status', accountingController.updatePurchaseStatus);
router.delete('/purchases/:id', accountingController.deletePurchase);

// 3. Bank Reconciliation
router.get('/bank-transactions', accountingController.getBankTransactions);
router.post('/bank-transactions/import', accountingController.importBankTransactions);
router.post('/bank-transactions/match', accountingController.matchTransaction);

// 4. Outstanding Reports
router.get('/reports/outstanding', accountingController.getOutstandingReport);

// 5. Portal Upload Tracker
router.get('/billed-invoices', accountingController.getBilledInvoices);
router.patch('/billed-invoices/:id/portal-status', accountingController.updatePortalStatus);
router.get('/receivables', accountingController.getUnpaidReceivables);

module.exports = router;
