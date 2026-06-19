const express = require('express');
const router = express.Router();
const shipController = require('../controllers/shipController');
const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');

// GET /api/shipments/fix-db (TEMPORARY FIX)
router.get('/fix-db', shipController.fixFlipkartAmount);

// GET /api/shipments/check-admin (TEMPORARY FIX)
router.get('/check-admin', shipController.checkAdmin);

// POST /api/shipments/create (requires Receptionist/Admin)
router.post('/create', verifyToken, checkRole('OPERATION'), shipController.createShipment);

// GET /api/shipments
router.get('/', verifyToken, shipController.listShipments);

// GET /api/shipments/stats
router.get('/stats', verifyToken, shipController.getStats);

// GET /api/shipments/invoices/pending (Requires Accountant/Admin)
router.get('/invoices/pending', verifyToken, checkRole(['ACCOUNTANT', 'ADMIN']), shipController.getPendingInvoices);

// POST /api/shipments/:trackingId/pay (Requires Accountant/Admin)
router.post('/:trackingId/pay', verifyToken, checkRole(['ACCOUNTANT', 'ADMIN']), shipController.processPayment);

// GET /api/shipments/:trackingId (Public tracker)
router.get('/:trackingId', shipController.getShipment);

module.exports = router;
