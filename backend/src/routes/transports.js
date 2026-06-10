const express = require('express');
const router = express.Router();
const transportController = require('../controllers/transportController');
const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');

// POST /api/transports/gate-clerk/verify (requires Gate Clerk/Admin)
router.post('/gate-clerk/verify', verifyToken, checkRole(['ADMIN', 'GATE_CLERK']), transportController.verifyDeliveryOtp);

module.exports = router;
