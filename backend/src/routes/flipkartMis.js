const express = require('express');
const router = express.Router();
const flipkartMisController = require('../controllers/flipkartMisController');
const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');

// Create a new Flipkart MIS record - accessible by Operators and Admins
router.post('/', (req, res, next) => {
  console.log('[DEBUG] POST /api/flipkart-mis request received');
  next();
}, verifyToken, checkRole(['OPERATION_EXECUTIVE', 'OPERATION', 'ADMIN']), (req, res, next) => {
  console.log('[DEBUG] POST /api/flipkart-mis auth check passed');
  next();
}, flipkartMisController.createRecord);

// Retrieve Flipkart MIS records - accessible by Operators, Accountants, and Admins
router.get('/', (req, res, next) => {
  console.log('[DEBUG] GET /api/flipkart-mis request received');
  next();
}, verifyToken, checkRole(['OPERATION_EXECUTIVE', 'OPERATION', 'ACCOUNTANT', 'ADMIN']), (req, res, next) => {
  console.log('[DEBUG] GET /api/flipkart-mis auth check passed');
  next();
}, flipkartMisController.getRecords);

// Export Flipkart MIS report to Excel - accessible by Accountants and Admins
router.get('/export', (req, res, next) => {
  console.log('[DEBUG] GET /api/flipkart-mis/export request received');
  next();
}, verifyToken, checkRole(['ACCOUNTANT', 'ADMIN']), (req, res, next) => {
  console.log('[DEBUG] GET /api/flipkart-mis/export auth check passed');
  next();
}, flipkartMisController.exportExcel);

module.exports = router;
