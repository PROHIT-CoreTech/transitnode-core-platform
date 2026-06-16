const express = require('express');
const router = express.Router();
const masterAdminController = require('../controllers/masterAdminController');
const verifyMasterKey = require('../middleware/verifyMasterKey');

// Apply verifyMasterKey middleware to all routes in this file
router.use(verifyMasterKey);

router.post('/onboard-automated', masterAdminController.onboardAutomated);
router.post('/onboard-manual', masterAdminController.onboardManual);
router.get('/dashboard-summary', masterAdminController.dashboardSummary);
router.get('/tenant/:tenantId', masterAdminController.getTenantDetails);

module.exports = router;
