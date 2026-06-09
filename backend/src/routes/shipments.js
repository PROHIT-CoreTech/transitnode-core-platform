const express = require('express');
const router = express.Router();
const shipController = require('../controllers/shipController');

// POST /api/shipments (requires Receptionist/Admin)
router.post('/', shipController.createShipment);

// GET /api/shipments
router.get('/', shipController.listShipments);

// GET /api/shipments/:trackingId (Public tracker)
router.get('/:trackingId', shipController.getShipment);

module.exports = router;
