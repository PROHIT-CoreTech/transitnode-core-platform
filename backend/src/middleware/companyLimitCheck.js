const Company = require('../models/NoSQL/Company');
const Tenant = require('../models/NoSQL/Tenant');

const companyLimitCheck = async (req, res, next) => {
  try {
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Missing tenant ID' });
    }

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    const companyCount = await Company.countDocuments({ tenantId });

    if (companyCount >= tenant.maxCompaniesAllowed || tenant.planType !== 'PLATINUM') {
      return res.status(403).json({
        success: false,
        message: 'Action Denied: Your current subscription tier limits corporate additions. Please upgrade to maximize your sister company slots.'
      });
    }

    next();
  } catch (error) {
    console.error('Company Limit Check Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during limit check' });
  }
};

module.exports = companyLimitCheck;
