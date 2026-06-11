const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payrollController');
const verifyToken = require('../middleware/verifyToken');

// In production use verifyToken
// router.use(verifyToken);

router.get('/', payrollController.getPayroll);
router.post('/calculate', payrollController.calculatePayroll);
router.post('/disburse', payrollController.disbursePayroll);

module.exports = router;
