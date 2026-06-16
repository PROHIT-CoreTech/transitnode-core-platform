const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Tenant = require('../models/NoSQL/Tenant');
const Company = require('../models/NoSQL/Company');
const User = require('../models/NoSQL/User');
const Device = require('../models/NoSQL/Device');
const TelemetryLog = require('../models/NoSQL/TelemetryLog');

// POST /api/master-admin/onboard-automated
exports.onboardAutomated = async (req, res) => {
  try {
    const { companyName, adminName, email, mobileNumber, selectedPlan } = req.body;

    if (!companyName || !adminName || !email || !mobileNumber || !selectedPlan) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const planType = selectedPlan.toUpperCase();
    if (!['TRIAL', 'SILVER', 'PLATINUM', 'LIFETIME'].includes(planType)) {
      return res.status(400).json({ error: 'Invalid plan type' });
    }

    // Generate sub domain
    const customSubdomain = companyName.toLowerCase().replace(/[^a-z0-9]/g, '') + '-' + Math.floor(Math.random() * 10000);

    // Calculate license expiry
    const licenseExpiresAt = new Date();
    if (planType === 'TRIAL') {
      licenseExpiresAt.setDate(licenseExpiresAt.getDate() + 14); // 14 days trial
    } else {
      licenseExpiresAt.setDate(licenseExpiresAt.getDate() + 365); // 1 year default
    }

    // 1. Create Tenant
    const tenant = new Tenant({
      companyName,
      registeredMobile: mobileNumber,
      customSubdomain,
      planType,
      licenseExpiresAt,
      adminSetupComplete: true,
      maxCompaniesAllowed: planType === 'PLATINUM' ? 3 : 1
    });
    await tenant.save();

    // 2. Create Company
    const company = new Company({
      tenantId: tenant._id,
      companyName: companyName,
      address: 'Update Address',
      contactNumber: mobileNumber
    });
    await company.save();

    // 3. Create ADMIN User
    const salt = await bcrypt.genSalt(10);
    const defaultPassword = 'TransitNode@' + new Date().getFullYear();
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);

    const user = new User({
      tenantId: tenant._id,
      username: email, // use email as username
      email,
      mobileNumber,
      password: hashedPassword,
      name: adminName,
      role: 'ADMIN'
    });
    await user.save();

    return res.status(201).json({
      message: 'Automated onboarding successful',
      tenantId: tenant._id,
      subdomain: customSubdomain,
      adminPassword: defaultPassword
    });

  } catch (error) {
    console.error('[MasterAdmin] onboardAutomated error:', error);
    return res.status(500).json({ error: 'Internal server error during automated onboarding.' });
  }
};

// POST /api/master-admin/onboard-manual
exports.onboardManual = async (req, res) => {
  try {
    const { companyName, registeredMobile, planType, customMaxCompanies, licenseDurationDays, amountPaid, address } = req.body;

    if (!companyName || !registeredMobile || !planType || !licenseDurationDays) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const uppercasePlanType = planType.toUpperCase();
    if (!['TRIAL', 'SILVER', 'PLATINUM', 'LIFETIME'].includes(uppercasePlanType)) {
      return res.status(400).json({ error: 'Invalid plan type' });
    }

    const licenseExpiresAt = new Date();
    licenseExpiresAt.setDate(licenseExpiresAt.getDate() + parseInt(licenseDurationDays, 10));

    const customSubdomain = companyName.toLowerCase().replace(/[^a-z0-9]/g, '') + '-' + Math.floor(Math.random() * 10000);
    const fullLoginUrl = `http://${customSubdomain}.localhost:3001/login`;

    // 1. Create Tenant
    const tenant = new Tenant({
      companyName,
      registeredMobile,
      customSubdomain,
      fullLoginUrl,
      planType: uppercasePlanType,
      licenseExpiresAt,
      maxCompaniesAllowed: customMaxCompanies ? parseInt(customMaxCompanies, 10) : (uppercasePlanType === 'PLATINUM' ? 3 : 1),
      adminSetupComplete: false,
      paymentStatus: 'PAID',
      address: address || ''
    });
    await tenant.save();

    // 2. Create Company
    const company = new Company({
      tenantId: tenant._id,
      companyName,
      address: address || 'Update Address',
      contactNumber: registeredMobile
    });
    await company.save();

    // 3. Log Revenue if Amount Paid is provided
    if (amountPaid && !isNaN(amountPaid)) {
      const SubscriptionTransaction = require('../models/NoSQL/SubscriptionTransaction');
      const transaction = new SubscriptionTransaction({
        tenantId: tenant._id,
        planType: uppercasePlanType,
        amount: parseFloat(amountPaid),
        paymentMethod: 'OFFLINE_MANUAL'
      });
      await transaction.save();
    }

    const setupLink = `http://${customSubdomain}.localhost:3001/setup-admin`;

    return res.status(201).json({
      message: 'Manual onboarding successful',
      tenantId: tenant._id,
      subdomain: customSubdomain,
      licenseExpiresAt,
      setupLink
    });

  } catch (error) {
    console.error('[MasterAdmin] onboardManual error:', error);
    return res.status(500).json({ error: 'Internal server error during manual onboarding.' });
  }
};

// GET /api/master-admin/dashboard-summary
exports.dashboardSummary = async (req, res) => {
  try {
    // 1. Total registered Tenants sorted by subscription tiers
    const tenantsByTier = await Tenant.aggregate([
      { $group: { _id: '$planType', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // 2. Active global vehicle count
    const activeVehiclesCount = await Device.countDocuments({ status: 'ACTIVE' });

    // 3. System-wide daily tracking volume
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const dailyTrackingVolume = await TelemetryLog.countDocuments({
      timestamp: { $gte: startOfDay }
    });

    // 4. List of all Tenants
    const allTenants = await Tenant.find({}, 'companyName planType registeredMobile customSubdomain licenseExpiresAt createdAt').sort({ createdAt: -1 });

    // 5. Total SaaS Revenue
    const SubscriptionTransaction = require('../models/NoSQL/SubscriptionTransaction');
    const revenueAggregation = await SubscriptionTransaction.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].total : 0;

    return res.status(200).json({
      tenantsByTier,
      activeVehiclesCount,
      dailyTrackingVolume,
      allTenants,
      totalRevenue
    });
  } catch (error) {
    console.error('[MasterAdmin] dashboardSummary error:', error);
    return res.status(500).json({ error: 'Internal server error fetching dashboard summary.' });
  }
};

// GET /api/master-admin/tenant/:tenantId
exports.getTenantDetails = async (req, res) => {
  try {
    const { tenantId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(tenantId)) {
      return res.status(400).json({ error: 'Invalid Tenant ID format' });
    }

    // Fetch core Tenant document
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    // Fetch primary/sister companies under this tenant
    const companies = await Company.find({ tenantId });

    // Fetch user count
    const userCount = await User.countDocuments({ tenantId });

    // Fetch active vehicles count
    const vehicleCount = await Device.countDocuments({ tenantId, status: 'ACTIVE' });

    // Aggregate into a detailed payload
    return res.status(200).json({
      tenant,
      companies,
      metrics: {
        totalUsers: userCount,
        activeVehicles: vehicleCount
      }
    });

  } catch (error) {
    console.error('[MasterAdmin] getTenantDetails error:', error);
    return res.status(500).json({ error: 'Internal server error fetching tenant details.' });
  }
};
