const express = require('express');
const router = express.Router();
const billController = require('../controllers/billController');

// POST /api/invoices
router.post('/', billController.generateBill);

// GET /api/invoices/pending
router.get('/pending', billController.getPendingInvoices);

module.exports = router;
