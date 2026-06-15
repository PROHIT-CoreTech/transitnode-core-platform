const express = require('express');
const router = express.Router();
const { createSisterCompany } = require('../controllers/companyController');
const authGuard = require('../middleware/authGuard');
const companyLimitCheck = require('../middleware/companyLimitCheck');
const checkRole = require('../middleware/checkRole');

router.post(
  '/create-sister-company',
  authGuard,
  checkRole('ADMIN'),
  companyLimitCheck,
  createSisterCompany
);

module.exports = router;
