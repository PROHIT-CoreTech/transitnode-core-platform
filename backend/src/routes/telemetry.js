const express = require('express');
const router = express.Router();
const telemetryController = require('../controllers/telemetryController');

// @route   POST /api/telemetry/location
// @desc    Webhook receiver for real-time vehicle GPS coordinates and Geofence monitoring
// @access  Public (or protected by API Key depending on tracking hardware configuration)
router.post('/location', telemetryController.processTelemetry);

module.exports = router;
