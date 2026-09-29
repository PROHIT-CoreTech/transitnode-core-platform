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
    } else if (planType === 'SILVER') {
      licenseExpiresAt.setFullYear(licenseExpiresAt.getFullYear() + 3); // 3 Years (36 Months)
    } else if (planType === 'PLATINUM') {
      licenseExpiresAt.setFullYear(licenseExpiresAt.getFullYear() + 5); // 5 Years (60 Months)
    } else if (planType === 'LIFETIME') {
      licenseExpiresAt.setFullYear(licenseExpiresAt.getFullYear() + 100);
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
    if (uppercasePlanType === 'TRIAL') {
      licenseExpiresAt.setDate(licenseExpiresAt.getDate() + 14); // 14 Days Trial
    } else if (uppercasePlanType === 'SILVER') {
      licenseExpiresAt.setFullYear(licenseExpiresAt.getFullYear() + 3); // 3 Years (36 Months)
    } else if (uppercasePlanType === 'PLATINUM') {
      licenseExpiresAt.setFullYear(licenseExpiresAt.getFullYear() + 5); // 5 Years (60 Months)
    } else if (uppercasePlanType === 'LIFETIME') {
      licenseExpiresAt.setFullYear(licenseExpiresAt.getFullYear() + 100); // Lifetime Access
    }

    const customSubdomain = companyName.toLowerCase().replace(/[^a-z0-9]/g, '') + '-' + Math.floor(Math.random() * 10000);
    const reqHost = req.headers.host || '';
    const isLocalhost = process.env.NODE_ENV === 'LOCALHOST' || reqHost.includes('localhost') || reqHost.includes('127.0.0.1');
    const frontendPort = process.env.FRONTEND_PORT || '3001';
    const frontendDomain = isLocalhost ? `localhost:${frontendPort}` : (process.env.FRONTEND_DOMAIN || 'transitnode.prohitcoretech.com');
    const protocol = isLocalhost ? 'http' : 'https';
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

    // 2. Log Revenue if Amount Paid is provided
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
    // Auto-purge requested target tenants if present
    await exports.purgeSpecifiedTenants();
    
    // 1. Total registered Tenants sorted by subscription tiers
    // Auto-clean duplicate Sister Company entries and fix plan license expiries
    const allTenantsList = await Tenant.find({});
    for (const t of allTenantsList) {
      await Company.deleteMany({ tenantId: t._id, companyName: t.companyName });

      const baseDate = t.createdAt ? new Date(t.createdAt) : new Date();
      const correctExpiry = new Date(baseDate);
      if (t.planType === 'SILVER') {
        correctExpiry.setFullYear(correctExpiry.getFullYear() + 3);
      } else if (t.planType === 'PLATINUM') {
        correctExpiry.setFullYear(correctExpiry.getFullYear() + 5);
      } else if (t.planType === 'LIFETIME') {
        correctExpiry.setFullYear(correctExpiry.getFullYear() + 100);
      } else if (t.planType === 'TRIAL') {
        correctExpiry.setDate(correctExpiry.getDate() + 14);
      }
      
      if (!t.licenseExpiresAt || Math.abs(new Date(t.licenseExpiresAt) - correctExpiry) > 24 * 60 * 60 * 1000) {
        t.licenseExpiresAt = correctExpiry;
        await t.save();
      }
    }

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
    const allTenants = await Tenant.find({}, 'companyName planType registeredMobile customSubdomain licenseExpiresAt createdAt isSuspended paymentStatus').sort({ createdAt: -1 });

    // Restore Offline Transport Pvt. Ltd. if present
    await Tenant.updateOne({ customSubdomain: 'offlinetransportpvtltd-7731' }, { $set: { paymentStatus: 'PAID', planType: 'PLATINUM' } });

    // 5. Total SaaS Revenue & Strict Payment Transaction Verification
    const SubscriptionTransaction = require('../models/NoSQL/SubscriptionTransaction');
    const { getCashfreeOrder, getCashfreeOrderPayments } = require('../config/cashfree');

    for (const t of allTenants) {
      if (t.planType && t.planType !== 'TRIAL' && t.planType !== 'LIFETIME') {
        const hasTx = await SubscriptionTransaction.findOne({ tenantId: t._id });

        // Preserve manually or offline provisioned PAID tenants (e.g. Offline Transport Pvt. Ltd.)
        if (t.paymentStatus === 'PAID') {
          if (!hasTx) {
            let amount = 50000;
            if (t.planType === 'PLATINUM') amount = 100000;
            await SubscriptionTransaction.create({
              tenantId: t._id,
              planType: t.planType,
              amount: amount,
              paymentMethod: 'OFFLINE_PAYMENT',
              createdAt: t.createdAt || new Date()
            });
          }
          continue;
        }

        // For PENDING tenants, check if they completed payment via Cashfree Gateway
        const orderId = `order_tenant_${t._id}`;
        let isTrulyPaid = false;
        try {
          const cfOrder = await getCashfreeOrder(orderId);
          if (cfOrder) {
            const payments = await getCashfreeOrderPayments(orderId);
            isTrulyPaid = Array.isArray(payments) && payments.some(p => p.payment_status === 'SUCCESS');
          }
        } catch (cfErr) {
          isTrulyPaid = false;
        }

        if (isTrulyPaid) {
          t.paymentStatus = 'PAID';
          await t.save();

          if (!hasTx) {
            let amount = 50000;
            if (t.planType === 'PLATINUM') amount = 100000;
            await SubscriptionTransaction.create({
              tenantId: t._id,
              planType: t.planType,
              amount: amount,
              paymentMethod: 'CASHFREE_GATEWAY',
              createdAt: t.createdAt || new Date()
            });
          }
        } else {
          // Unpaid / pending online order
          await SubscriptionTransaction.deleteMany({ tenantId: t._id });
        }
      }
    }

    const revenueAggregation = await SubscriptionTransaction.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].total : 0;

    // 6. Recent Transactions History (deduplicated by tenant & plan window)
    const rawTransactions = await SubscriptionTransaction.find({})
      .populate('tenantId', 'companyName')
      .sort({ createdAt: -1 });

    const recentTransactions = [];
    const seenTenantWindowMap = new Map();

    for (const tx of rawTransactions) {
      if (!tx.tenantId) continue;
      const tenantKey = `${tx.tenantId._id ? tx.tenantId._id.toString() : tx.tenantId.toString()}_${tx.planType}`;
      if (seenTenantWindowMap.has(tenantKey)) {
        const prevTxTime = seenTenantWindowMap.get(tenantKey);
        const diffMs = Math.abs(new Date(tx.createdAt) - new Date(prevTxTime));
        if (diffMs < 30 * 60 * 1000) {
          continue; // Bypasses duplicate double entry created within 30 minutes
        }
      }
      seenTenantWindowMap.set(tenantKey, tx.createdAt);
      recentTransactions.push(tx);
    }

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

    // Strict Cashfree Payment Verification for Modal Details View
    if (tenant.planType && tenant.planType !== 'TRIAL' && tenant.planType !== 'LIFETIME' && tenant.paymentStatus !== 'PAID') {
      try {
        const { getCashfreeOrder, getCashfreeOrderPayments } = require('../config/cashfree');
        const orderId = `order_tenant_${tenant._id}`;
        const cfOrder = await getCashfreeOrder(orderId);
        let isTrulyPaid = false;
        if (cfOrder) {
          const payments = await getCashfreeOrderPayments(orderId);
          isTrulyPaid = Array.isArray(payments) && payments.some(p => p.payment_status === 'SUCCESS');
        }
        if (isTrulyPaid) {
          tenant.paymentStatus = 'PAID';
          await tenant.save();
        }
      } catch (cfErr) {
        // Leave current status for manual/offline provisioned tenants
      }
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

// PUT /api/master-admin/tenant/:tenantId/subscription
exports.updateTenantSubscription = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { planType } = req.body;

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    if (planType) {
      const upperPlan = planType.toUpperCase();

      // Look up dynamic plan in SubscriptionPlan collection if available
      const planConfig = await SubscriptionPlan.findOne({ planKey: upperPlan });

      let durationDays = 365;
      if (planConfig && planConfig.durationDays) {
        durationDays = planConfig.durationDays;
      } else if (upperPlan === 'TRIAL') {
        durationDays = 14;
      } else if (upperPlan === 'SILVER') {
        durationDays = 1095; // 3 Years (36 Months)
      } else if (upperPlan === 'PLATINUM') {
        durationDays = 1825; // 5 Years (60 Months)
      } else if (upperPlan === 'LIFETIME') {
        durationDays = 36500; // Lifetime Access
      }

      tenant.planType = upperPlan;
      tenant.maxCompaniesAllowed = (upperPlan === 'PLATINUM' || upperPlan === 'LIFETIME') ? 999 : 1;
      tenant.paymentStatus = upperPlan === 'TRIAL' ? 'PENDING' : 'PAID';
      tenant.isSuspended = false;
      tenant.hasUsedTrial = true;

      const newExpiry = new Date();
      newExpiry.setDate(newExpiry.getDate() + durationDays);
      tenant.licenseExpiresAt = newExpiry;
    }

    await tenant.save();

    return res.status(200).json({
      message: 'Tenant subscription updated successfully.',
      tenant
    });
  } catch (error) {
    console.error('[MasterAdmin] updateTenantSubscription error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error updating tenant subscription.' });
  }
};


// Purge specified tenants from attached image
exports.purgeSpecifiedTenants = async (req, res) => {
  try {
    const TARGET_SUBDOMAINS = [
      'inc',
      'data',
      'emirates',
      'shreesha',
      'shradhha',
      'server',
      'versal',
      'silvertransport',
      'manualcargotransport-2054',
      'patil'
    ];

    const tenantsToDelete = await Tenant.find({ customSubdomain: { $in: TARGET_SUBDOMAINS } });
    if (tenantsToDelete.length === 0) {
      if (res) return res.status(200).json({ message: 'Target tenants already purged.' });
      return;
    }

    const tenantIds = tenantsToDelete.map(t => t._id);

    const SubscriptionTransaction = require('../models/NoSQL/SubscriptionTransaction');
    await User.deleteMany({ tenantId: { $in: tenantIds } });
    await SubscriptionTransaction.deleteMany({ tenantId: { $in: tenantIds } });

    const mongoose = require('mongoose');
    const db = mongoose.connection.db;
    const collectionNames = ['companies', 'suppliers', 'drivers', 'fleets', 'ratecards', 'runsheets', 'telemetrylogs', 'vendorratecards'];

    for (const name of collectionNames) {
      try {
        const col = db.collection(name);
        await col.deleteMany({ tenantId: { $in: tenantIds } });
      } catch (err) {}
    }

    await Tenant.deleteMany({ _id: { $in: tenantIds } });

    console.log(`[PURGE] Successfully purged ${tenantIds.length} target tenants and all associated database records.`);
    if (res) return res.status(200).json({ message: `Successfully deleted ${tenantIds.length} specified tenants.` });
  } catch (error) {
    console.error('[PURGE ERROR]', error);
    if (res) return res.status(500).json({ error: 'Failed to purge specified tenants.' });
  }
};

// ==========================================
// SUBSCRIPTION PLANS MANAGEMENT
// ==========================================
const SubscriptionPlan = require('../models/NoSQL/SubscriptionPlan');
const Coupon = require('../models/NoSQL/Coupon');

const DEFAULT_PLANS = [
  {
    planKey: 'TRIAL',
    title: '10 Day Exploration',
    badgeText: 'TRANCEZARDS',
    tagline: 'Start exploring all transit management capabilities.',
    price: 0,
    originalPrice: 0,
    currency: 'INR',
    priceDisplay: '₹0',
    durationDays: 14,
    durationLabel: '14 Days',
    features: ['Scale Global Logistics', 'Fleet management'],
    buttonText: 'Start Free Trial',
    accentColor: 'blue',
    isPopular: false,
    isActive: true
  },
  {
    planKey: 'SILVER',
    title: 'Silver Plan',
    badgeText: 'TRANCEZARDS',
    tagline: 'Ideal for growing regional fleet operators.',
    price: 50000,
    originalPrice: 65000,
    currency: 'INR',
    priceDisplay: '₹50k',
    durationDays: 1095,
    durationLabel: '3 Years',
    features: ['Scale Global Logistics', 'Fleet management'],
    buttonText: 'Upgrade to 3 Years',
    accentColor: 'emerald',
    isPopular: true,
    isActive: true
  },
  {
    planKey: 'PLATINUM',
    title: 'Platinum Plan',
    badgeText: 'TRANCEZARDS',
    tagline: 'Enterprise logistics with multi-company management.',
    price: 50000,
    originalPrice: 85000,
    currency: 'INR',
    priceDisplay: '₹50k',
    durationDays: 1825,
    durationLabel: '5 Years',
    features: ['Scale Global Logistics', 'Fleet management', 'Multi-Company Portal'],
    buttonText: 'Upgrade to 5 Years',
    accentColor: 'amber',
    isPopular: false,
    isActive: true
  },
  {
    planKey: 'LIFETIME',
    title: 'Lifetime Access',
    badgeText: 'TRANCEZARDS',
    tagline: 'Unlimited perpetual access for scaling enterprises.',
    price: 50000,
    originalPrice: 150000,
    currency: 'INR',
    priceDisplay: '₹50k',
    durationDays: 36500,
    durationLabel: 'Lifetime',
    features: ['Scale Global Logistics', 'Fleet management', 'Multi-Company Portal', 'Custom Branding & Subdomain'],
    buttonText: 'Upgrade to Lifetime',
    accentColor: 'purple',
    isPopular: false,
    isActive: true
  }
];

const seedPlansIfEmpty = async () => {
  const count = await SubscriptionPlan.countDocuments();
  if (count === 0) {
    await SubscriptionPlan.insertMany(DEFAULT_PLANS);
    console.log('[SubscriptionPlan] Default plans initialized.');
  }
  return await SubscriptionPlan.find().sort({ createdAt: 1 });
};

exports.getSubscriptionPlans = async (req, res) => {
  try {
    const plans = await seedPlansIfEmpty();
    return res.status(200).json({ success: true, plans });
  } catch (error) {
    console.error('[MasterAdmin] getSubscriptionPlans error:', error);
    return res.status(500).json({ error: 'Failed to fetch subscription plans' });
  }
};

exports.updateSubscriptionPlanConfig = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, badgeText, tagline, price, originalPrice, priceDisplay, durationDays, durationLabel, features, buttonText, accentColor, isPopular, isActive } = req.body;

    let plan = await SubscriptionPlan.findById(id);
    if (!plan) {
      plan = await SubscriptionPlan.findOne({ planKey: id.toUpperCase() });
    }

    if (!plan) {
      return res.status(404).json({ error: 'Subscription plan not found' });
    }

    if (title !== undefined) plan.title = title;
    if (badgeText !== undefined) plan.badgeText = badgeText;
    if (tagline !== undefined) plan.tagline = tagline;
    if (price !== undefined) plan.price = Number(price);
    if (originalPrice !== undefined) plan.originalPrice = originalPrice !== null ? Number(originalPrice) : null;
    if (priceDisplay !== undefined) plan.priceDisplay = priceDisplay;
    if (durationDays !== undefined) plan.durationDays = Number(durationDays);
    if (durationLabel !== undefined) plan.durationLabel = durationLabel;
    if (features !== undefined && Array.isArray(features)) plan.features = features;
    if (buttonText !== undefined) plan.buttonText = buttonText;
    if (accentColor !== undefined) plan.accentColor = accentColor;
    if (isPopular !== undefined) plan.isPopular = Boolean(isPopular);
    await plan.save();

    return res.status(200).json({ success: true, message: 'Subscription plan updated successfully', plan });
  } catch (error) {
    console.error('[MasterAdmin] updateSubscriptionPlanConfig error:', error);
    return res.status(500).json({ error: 'Failed to update subscription plan' });
  }
};

exports.createSubscriptionPlan = async (req, res) => {
  try {
    const { planKey, title, badgeText, tagline, price, originalPrice, priceDisplay, durationDays, durationLabel, features, buttonText, accentColor, isPopular, isActive } = req.body;

    if (!planKey || !title) {
      return res.status(400).json({ error: 'Plan Key and Title are required' });
    }

    const cleanKey = planKey.trim().toUpperCase();
    let plan = await SubscriptionPlan.findOne({ planKey: cleanKey });
    if (!plan) {
      plan = new SubscriptionPlan({ planKey: cleanKey });
    }

    plan.title = title;
    plan.badgeText = badgeText || 'TRANCEZARDS';
    plan.tagline = tagline || '';
    plan.price = Number(price) || 0;
    plan.originalPrice = originalPrice ? Number(originalPrice) : null;
    plan.priceDisplay = priceDisplay || `₹${price || 0}`;
    plan.durationDays = Number(durationDays) || 365;
    plan.durationLabel = durationLabel || '1 Year';
    plan.features = Array.isArray(features) ? features : [];
    plan.buttonText = buttonText || 'Upgrade Plan';
    plan.accentColor = accentColor || 'blue';
    plan.isPopular = Boolean(isPopular);
    plan.isActive = isActive !== undefined ? Boolean(isActive) : true;

    await plan.save();
    return res.status(200).json({ success: true, message: `Subscription plan '${cleanKey}' saved successfully`, plan });
  } catch (error) {
    console.error('[MasterAdmin] createSubscriptionPlan error:', error);
    return res.status(500).json({ error: error.message || 'Failed to save subscription plan' });
  }
};


exports.deleteSubscriptionPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await SubscriptionPlan.findByIdAndDelete(id);
    if (!plan) {
      return res.status(404).json({ error: 'Subscription plan not found' });
    }
    return res.status(200).json({ success: true, message: 'Subscription plan deleted successfully' });
  } catch (error) {
    console.error('[MasterAdmin] deleteSubscriptionPlan error:', error);
    return res.status(500).json({ error: 'Failed to delete subscription plan' });
  }
};


// ==========================================
// COUPON & OFFERS MANAGEMENT
// ==========================================
exports.getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, coupons });
  } catch (error) {
    console.error('[MasterAdmin] getCoupons error:', error);
    return res.status(500).json({ error: 'Failed to fetch coupons' });
  }
};

exports.createCoupon = async (req, res) => {
  try {
    const { code, description, discountType, discountValue, minOrderAmount, maxDiscountAmount, maxRedemptions, applicablePlans, validUntil, isActive } = req.body;

    if (!code || !discountValue) {
      return res.status(400).json({ error: 'Coupon code and discount value are required' });
    }

    const cleanCode = code.trim().toUpperCase();
    const existing = await Coupon.findOne({ code: cleanCode });
    if (existing) {
      return res.status(400).json({ error: `Coupon code '${cleanCode}' already exists` });
    }

    const coupon = new Coupon({
      code: cleanCode,
      description: description || '',
      discountType: discountType || 'PERCENTAGE',
      discountValue: Number(discountValue),
      minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
      maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
      maxRedemptions: maxRedemptions ? Number(maxRedemptions) : null,
      applicablePlans: Array.isArray(applicablePlans) && applicablePlans.length > 0 ? applicablePlans : ['ALL'],
      validUntil: validUntil ? new Date(validUntil) : null,
      isActive: isActive !== undefined ? Boolean(isActive) : true
    });

    await coupon.save();
    return res.status(201).json({ success: true, message: 'Coupon created successfully', coupon });
  } catch (error) {
    console.error('[MasterAdmin] createCoupon error:', error);
    return res.status(500).json({ error: 'Failed to create coupon' });
  }
};

exports.updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, discountType, discountValue, minOrderAmount, maxDiscountAmount, maxRedemptions, applicablePlans, validUntil, isActive } = req.body;

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({ error: 'Coupon not found' });
    }

    if (description !== undefined) coupon.description = description;
    if (discountType !== undefined) coupon.discountType = discountType;
    if (discountValue !== undefined) coupon.discountValue = Number(discountValue);
    if (minOrderAmount !== undefined) coupon.minOrderAmount = Number(minOrderAmount);
    if (maxDiscountAmount !== undefined) coupon.maxDiscountAmount = maxDiscountAmount ? Number(maxDiscountAmount) : null;
    if (maxRedemptions !== undefined) coupon.maxRedemptions = maxRedemptions ? Number(maxRedemptions) : null;
    if (applicablePlans !== undefined && Array.isArray(applicablePlans)) coupon.applicablePlans = applicablePlans;
    if (validUntil !== undefined) coupon.validUntil = validUntil ? new Date(validUntil) : null;
    if (isActive !== undefined) coupon.isActive = Boolean(isActive);

    await coupon.save();
    return res.status(200).json({ success: true, message: 'Coupon updated successfully', coupon });
  } catch (error) {
    console.error('[MasterAdmin] updateCoupon error:', error);
    return res.status(500).json({ error: 'Failed to update coupon' });
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) {
      return res.status(404).json({ error: 'Coupon not found' });
    }
    return res.status(200).json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error('[MasterAdmin] deleteCoupon error:', error);
    return res.status(500).json({ error: 'Failed to delete coupon' });
  }
};

