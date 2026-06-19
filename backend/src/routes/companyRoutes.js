const express = require('express');
const router = express.Router();
const { addSisterCompany, getWorkspaces, updateCompany, deleteCompany, updateInvoiceFormat } = require('../controllers/companyController');
const authGuard = require('../middleware/authGuard');
const { ensureLifetimeTier } = require('../middleware/tierGuard');
const Company = require('../models/NoSQL/Company');
const Tenant = require('../models/NoSQL/Tenant');

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
  upload.single('invoiceTemplate'),
  addSisterCompany
);

router.put(
  '/workspace/:id/invoice-format',
  authGuard,
  ensureLifetimeTier,
  upload.single('invoiceTemplate'),
  updateInvoiceFormat
);

router.get(
  '/my-workspaces',
  authGuard,
  getWorkspaces
);

router.put(
  '/:id',
  authGuard,
  updateCompany
);

router.delete(
  '/:id',
  authGuard,
  deleteCompany
);

module.exports = router;
