const Tenant = require('../models/NoSQL/Tenant');
const User = require('../models/NoSQL/User');
const SubscriptionTransaction = require('../models/NoSQL/SubscriptionTransaction');
const crypto = require('crypto');

exports.registerTenant = async (req, res) => {
  try {
    const { companyName, registeredMobile, customSubdomain, planTier } = req.body;

    if (!companyName || !registeredMobile || !customSubdomain) {
      return res.status(400).json({ error: 'companyName, registeredMobile, and customSubdomain are required' });
    }

    // Check if subdomain exists
    const existingTenant = await Tenant.findOne({ customSubdomain });
    if (existingTenant) {
      return res.status(400).json({ error: 'Subdomain is already registered' });
    }

    // Set 10 days expiry for trial, or handle differently for paid
    const licenseExpiresAt = new Date();
    licenseExpiresAt.setDate(licenseExpiresAt.getDate() + 10);
    
    // Generate the full login URL dynamically based on environment
    const frontendDomain = process.env.FRONTEND_DOMAIN || 'localhost:3001';
    const protocol = frontendDomain.includes('localhost') ? 'http' : 'https';
    const fullLoginUrl = `${protocol}://${customSubdomain}.${frontendDomain}/login`;

    const upperPlanTier = planTier ? planTier.toUpperCase() : 'TRIAL';
    const mappedPlanType = upperPlanTier === 'FREE' ? 'TRIAL' : upperPlanTier;

    const newTenant = new Tenant({
      companyName,
      registeredMobile,
      customSubdomain,
      fullLoginUrl,
      planType: mappedPlanType,
      licenseExpiresAt,
    });

    await newTenant.save();

    // Log the initial transaction if it's a paid plan
    const SubscriptionTransaction = require('../models/NoSQL/SubscriptionTransaction');
    let amount = 0;
    const pType = newTenant.planType;
    if (pType === 'LIFETIME') amount = 500000;
    else if (pType === 'PLATINUM') amount = 100000;
    else if (pType === 'SILVER') amount = 50000;

    if (amount > 0) {
      const transaction = new SubscriptionTransaction({
        tenantId: newTenant._id,
        planType: pType,
        amount: amount,
        paymentMethod: 'ONLINE_CHECKOUT'
      });
      await transaction.save();
    }

    const bcrypt = require('bcrypt');
    const fallbackPassword = crypto.randomBytes(16).toString('hex'); // Long secure fallback
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(fallbackPassword, salt);
    
    const magicToken = crypto.randomBytes(32).toString('hex');
    const magicLinkExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const newAdmin = new User({
      tenantId: newTenant._id,
      username: registeredMobile,
      email: `admin@${customSubdomain}.prohitcoretech.in`,
      mobileNumber: registeredMobile,
      password: hashedPassword,
      name: `Admin - ${companyName}`,
      role: 'ADMIN',
      magicLinkToken: magicToken,
      magicLinkExpires: magicLinkExpires
    });

    await newAdmin.save();

    // MOCK EMAIL SENDING
    console.log('\n======================================================');
    console.log('MOCK EMAIL SENT TO:', `admin@${customSubdomain}.prohitcoretech.in`);
    console.log('SUBJECT: Welcome to PROHIT CoreTech - Your Workspace is Ready');
    console.log(`MAGIC LOGIN LINK:`);
    console.log(`${protocol}://${customSubdomain}.${frontendDomain}/magic-login/${magicToken}`);
    console.log('======================================================\n');

    return res.status(201).json({
      message: 'Tenant registered successfully. A magic login link has been sent to your email/mobile.',
      tenantId: newTenant._id,
    });
  } catch (error) {
    console.error('Error in registerTenant:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
exports.getTenantProfile = async (req, res) => {
  try {
    const { subdomain } = req.query;
    if (!subdomain) {
      return res.status(400).json({ error: 'Subdomain is required' });
    }

    const tenant = await Tenant.findOne({ customSubdomain: subdomain });
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    // Verify license status
    const now = new Date();
    if (tenant.licenseExpiresAt && tenant.licenseExpiresAt < now) {
      return res.status(403).json({ error: 'Tenant subscription has expired or is suspended' });
    }

    return res.status(200).json({
      tenantId: tenant._id,
      companyName: tenant.companyName,
      customSubdomain: tenant.customSubdomain,
      planType: tenant.planType,
      paymentStatus: tenant.paymentStatus,
      adminSetupComplete: tenant.adminSetupComplete,
      // Default theme settings (can be expanded later via db)
      themeColorHex: '#0d9488', // teal-600 default
      logoAssetString: 'default_tenant_logo',
    });
  } catch (error) {
    console.error('Error in getTenantProfile:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.processCheckout = async (req, res) => {
  try {
    const { paymentMethod, amount } = req.body;
    // We already have req.user from authGuard
    const tenantId = req.user.tenantId;

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    if (tenant.paymentStatus === 'PAID') {
      return res.status(400).json({ error: 'Tenant is already marked as PAID' });
    }

    // Extend license based on plan Type
    const licenseExpiresAt = new Date();
    if (tenant.planType === 'LIFETIME') {
      licenseExpiresAt.setFullYear(licenseExpiresAt.getFullYear() + 100);
    } else if (tenant.planType === 'PLATINUM') {
      licenseExpiresAt.setFullYear(licenseExpiresAt.getFullYear() + 5);
    } else if (tenant.planType === 'SILVER') {
      licenseExpiresAt.setFullYear(licenseExpiresAt.getFullYear() + 3);
    } else {
      // Default to +30 days if somehow checkout is hit for a free trial
      licenseExpiresAt.setDate(licenseExpiresAt.getDate() + 30);
    }

    // Update Tenant
    tenant.paymentStatus = 'PAID';
    tenant.licenseExpiresAt = licenseExpiresAt;
    await tenant.save();

    // Record Transaction
    const transaction = new SubscriptionTransaction({
      tenantId: tenant._id,
      planType: tenant.planType,
      amount: amount || 0,
      paymentMethod: paymentMethod || 'unknown'
    });
    await transaction.save();

    return res.status(200).json({ 
      success: true, 
      message: 'Payment processed successfully', 
      licenseExpiresAt 
    });
  } catch (error) {
    console.error('Error in processCheckout:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.updateTenantProfile = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    console.log('--- DEBUG updateTenantProfile ---');
    console.log('req.user:', req.user);
    console.log('tenantId:', tenantId);
    
    const { companyName, gstin, pan, address, state, stateCode, contactNumber } = req.body;

    const tenant = await Tenant.findById(tenantId);
    console.log('Found tenant:', tenant ? tenant._id : 'NOT FOUND');
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    if (companyName) tenant.companyName = companyName;
    if (gstin !== undefined) tenant.gstin = gstin;
    if (pan !== undefined) tenant.pan = pan;
    if (address !== undefined) tenant.address = address;
    if (state !== undefined) tenant.state = state;
    if (stateCode !== undefined) tenant.stateCode = stateCode;
    if (contactNumber !== undefined) tenant.contactNumber = contactNumber;

    await tenant.save();

    return res.status(200).json({ success: true, message: 'Primary Workspace updated successfully', tenant });
  } catch (error) {
    console.error('Error in updateTenantProfile:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.updateInvoiceFormat = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded. Please upload a valid PDF template.' });
    }

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    tenant.customInvoiceTemplateUrl = `/uploads/${req.file.filename}`;
    await tenant.save();

    return res.status(200).json({ success: true, message: 'Invoice template updated successfully', customInvoiceTemplateUrl: tenant.customInvoiceTemplateUrl });
  } catch (error) {
    console.error('Update Tenant Invoice Format Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error while updating invoice format' });
  }
};
