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
    const frontendDomain = process.env.FRONTEND_DOMAIN || 'localhost:3001';
    const protocol = frontendDomain.includes('localhost') ? 'http' : 'https';
    const fullLoginUrl = `${protocol}://${customSubdomain}.${frontendDomain}/login`;

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

    const setupLink = `${protocol}://${customSubdomain}.${frontendDomain}/setup-admin`;
    
    console.log('\n======================================================');
    console.log('MOCK EMAIL/SMS SENT TO:', registeredMobile);
    console.log('SUBJECT: Welcome to PROHIT CoreTech - Setup Your Admin Account');
    console.log('SETUP LINK:');
    console.log(setupLink);
    console.log('======================================================\n');

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

    // 6. Recent Transactions History
    const recentTransactions = await SubscriptionTransaction.find({})
      .populate('tenantId', 'companyName')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      tenantsByTier,
      activeVehiclesCount,
      dailyTrackingVolume,
      allTenants,
      totalRevenue,
      recentTransactions
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

// POST /api/master-admin/setup-first-user
exports.setupFirstUser = async (req, res) => {
  try {
    const companyName = 'Master Admin Corp';
    const email = 'master@transitnode.com';
    const mobileNumber = '9999999999';
    const passwordPlain = req.body.password || 'admin123';

    // 1. Check if Master Tenant already exists
    let tenant = await Tenant.findOne({ customSubdomain: 'masteradmin' });
    let user;

    if (tenant) {
      // Check if user exists
      user = await User.findOne({ email, tenantId: tenant._id });
      if (user) {
        return res.status(400).json({ error: 'Master admin user already exists' });
      }
    } else {
      // Create Tenant
      tenant = new Tenant({
        companyName,
        registeredMobile: mobileNumber,
        customSubdomain: 'masteradmin',
        planType: 'LIFETIME',
        licenseExpiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 100)), // 100 years
        adminSetupComplete: true,
        maxCompaniesAllowed: 999
      });
      await tenant.save();
      
      // Create Company
      const company = new Company({
        tenantId: tenant._id,
        companyName,
        address: 'Global HQ',
        contactNumber: mobileNumber
      });
      await company.save();
    }

    // 2. Create User
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(passwordPlain, salt);

    user = new User({
      tenantId: tenant._id,
      username: email,
      email,
      mobileNumber,
      password: hashedPassword,
      name: 'Master User',
      role: 'ADMIN'
    });
    await user.save();

    return res.status(201).json({
      message: 'Master admin user initialized successfully',
      email,
      password: passwordPlain
    });

  } catch (error) {
    console.error('[MasterAdmin] setupFirstUser error:', error);
    return res.status(500).json({ error: 'Internal server error during master user initialization.' });
  }
};

// PUT /api/master-admin/tenant/:tenantId/suspend
exports.toggleTenantSuspension = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { isSuspended } = req.body;

    if (typeof isSuspended !== 'boolean') {
      return res.status(400).json({ error: 'isSuspended must be a boolean value' });
    }

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    tenant.isSuspended = isSuspended;
    await tenant.save();

    return res.status(200).json({
      message: `Tenant has been successfully ${isSuspended ? 'suspended' : 'activated'}.`,
      tenant
    });
  } catch (error) {
    console.error('[MasterAdmin] toggleTenantSuspension error:', error);
    return res.status(500).json({ error: 'Internal server error toggling tenant suspension.' });
  }
};
