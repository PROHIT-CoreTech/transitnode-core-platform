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

// @route   POST /api/saas/checkout
// @desc    Process SaaS payment gateway checkout
// @access  Private
router.post('/checkout', authGuard, saasController.processCheckout);

// @route   PUT /api/saas/tenant-profile
// @desc    Update tenant profile details
// @access  Private
router.put('/tenant-profile', authGuard, saasController.updateTenantProfile);

module.exports = router;
