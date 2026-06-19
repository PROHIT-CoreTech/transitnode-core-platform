const express = require('express');
const router = express.Router();
const saasController = require('../controllers/saasController');

// @route   POST /api/saas/register-tenant
// @desc    Register a new tenant
// @access  Public
router.post('/register-tenant', saasController.registerTenant);

// @route   GET /api/saas/tenant-profile
// @desc    Get tenant profile by subdomain
// @access  Public
router.get('/tenant-profile', saasController.getTenantProfile);

const authGuard = require('../middleware/authGuard');
const { ensureLifetimeTier } = require('../middleware/tierGuard');

const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});
const upload = multer({ storage: storage });

// @route   POST /api/saas/checkout
// @desc    Process SaaS payment gateway checkout
// @access  Private
router.post('/checkout', authGuard, saasController.processCheckout);

// @route   PUT /api/saas/tenant-profile
// @desc    Update tenant profile details
// @access  Private
router.put('/tenant-profile', authGuard, saasController.updateTenantProfile);

// @route   PUT /api/saas/tenant-profile/invoice-format
// @desc    Update tenant custom invoice template
// @access  Private
router.put('/tenant-profile/invoice-format', authGuard, ensureLifetimeTier, upload.single('invoiceTemplate'), saasController.updateInvoiceFormat);

module.exports = router;
