const express = require('express');
const router = express.Router();
const billController = require('../controllers/billController');
const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');

const adminController = require('../controllers/adminController');

// GET /api/invoices/pending - get pending shipments for billing
router.get('/pending', verifyToken, checkRole(['ACCOUNTANT', 'ADMIN']), billController.getPendingInvoices);

// GET /api/invoices/rates - get global rates
router.get('/rates', verifyToken, checkRole(['ACCOUNTANT', 'ADMIN']), adminController.getRates);

// PATCH /api/invoices/settle/:trackingNumber
router.patch('/settle/:trackingNumber', verifyToken, checkRole(['ACCOUNTANT', 'ADMIN']), billController.settleInvoice);

// PATCH /api/invoices/monthly/:trackingNumber
router.patch('/monthly/:trackingNumber', verifyToken, checkRole(['ACCOUNTANT', 'ADMIN']), billController.markAsMonthly);

// Consolidated Monthly Billing
router.get('/consolidated/suppliers', verifyToken, checkRole(['ACCOUNTANT', 'ADMIN']), billController.getPendingMonthlyBySupplier);
router.post('/consolidated', verifyToken, checkRole(['ACCOUNTANT', 'ADMIN']), billController.createConsolidatedInvoice);
router.get('/consolidated', verifyToken, checkRole(['ACCOUNTANT', 'ADMIN']), billController.getConsolidatedInvoices);
router.patch('/consolidated/:id/settle', verifyToken, checkRole(['ACCOUNTANT', 'ADMIN']), billController.settleConsolidatedInvoice);
router.get('/consolidated/:id/export', verifyToken, checkRole(['ACCOUNTANT', 'ADMIN']), billController.exportConsolidatedInvoice);

module.exports = router;
