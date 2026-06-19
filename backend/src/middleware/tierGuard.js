const Tenant = require('../models/NoSQL/Tenant');

const ensureLifetimeTier = async (req, res, next) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Tenant ID missing' });
    }

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    if (tenant.planType !== 'LIFETIME') {
      return res.status(403).json({
        success: false,
        message: 'Feature Restricted: Custom invoice formatting templates are exclusively available to our Lifetime Ownership Plan subscribers.'
      });
    }

    next();
  } catch (error) {
    console.error('Tier Guard Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during tier verification' });
  }
};

module.exports = {
  ensureLifetimeTier
};
