const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');
const verifyToken = require('../middleware/verifyToken');

router.use(verifyToken);

router.get('/', exportController.exportFinancialData);

module.exports = router;
