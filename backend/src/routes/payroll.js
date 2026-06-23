const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payrollController');
const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');

// In production use verifyToken
router.use(verifyToken);
router.use(checkRole(['ACCOUNTANT', 'ADMIN']));

router.get('/', payrollController.getPayroll);
router.post('/calculate', payrollController.calculatePayroll);
router.post('/disburse', payrollController.disbursePayroll);

module.exports = router;
