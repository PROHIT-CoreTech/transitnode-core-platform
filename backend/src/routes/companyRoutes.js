const express = require('express');
const router = express.Router();
const { addSisterCompany, getWorkspaces } = require('../controllers/companyController');
const authGuard = require('../middleware/authGuard');
const Company = require('../models/NoSQL/Company');
const Tenant = require('../models/NoSQL/Tenant');

const adminAndLimitCheck = async (req, res, next) => {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Action Blocked: Sister company creation is restricted to account administrators on eligible tiers.'
      });
    }

    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const tenant = await Tenant.findById(tenantId);
    if (!tenant || tenant.planType !== 'LIFETIME') {
      return res.status(403).json({
        success: false,
        message: 'Action Blocked: Sister company creation is restricted to account administrators on eligible tiers.'
      });
    }

    const companyCount = await Company.countDocuments({ tenantId });
    if (companyCount >= 3) {
      return res.status(403).json({
        success: false,
        message: 'Action Blocked: Sister company creation is restricted to account administrators on eligible tiers.'
      });
    }
    
    next();
  } catch (error) {
    console.error('Admin and Limit Check Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

router.post(
  '/add-sister',
  authGuard,
  adminAndLimitCheck,
  addSisterCompany
);

router.get(
  '/my-workspaces',
  authGuard,
  getWorkspaces
);

module.exports = router;
