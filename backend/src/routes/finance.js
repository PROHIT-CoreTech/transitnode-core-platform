const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');
const verifyToken = require('../middleware/verifyToken');

// Apply auth middleware if needed, skipping for now to ease testing, but in production use verifyToken
// router.use(verifyToken);

router.get('/ledger', financeController.getTrialBalance);
router.get('/pnl', financeController.getPnL);

module.exports = router;
