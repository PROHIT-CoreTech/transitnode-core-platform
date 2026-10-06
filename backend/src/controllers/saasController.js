const Tenant = require('../models/NoSQL/Tenant');
const User = require('../models/NoSQL/User');
const SubscriptionTransaction = require('../models/NoSQL/SubscriptionTransaction');
const SubscriptionPlan = require('../models/NoSQL/SubscriptionPlan');
const Coupon = require('../models/NoSQL/Coupon');
const crypto = require('crypto');
const { verifyWebhookSignature } = require('../config/cashfree');


exports.registerTenant = async (req, res) => {
  try {
    const { companyName, registeredMobile, customSubdomain, planTier, logoUrl, dominantHexColor, requireDriverMobileApp } = req.body;

    if (!companyName || !registeredMobile || !customSubdomain) {
      return res.status(400).json({ error: 'companyName, registeredMobile, and customSubdomain are required' });
    }

    // Check if subdomain exists
    const existingTenant = await Tenant.findOne({ customSubdomain });
    if (existingTenant) {
      return res.status(400).json({ error: 'Subdomain is already registered' });
    }

    // Check if user with this mobile number already exists
    const existingUser = await User.findOne({ username: registeredMobile });
    if (existingUser) {
      return res.status(400).json({ error: 'A user with this mobile number is already registered' });
    }

    const upperPlanTier = planTier ? planTier.toUpperCase() : 'TRIAL';
    const mappedPlanType = upperPlanTier === 'FREE' ? 'TRIAL' : upperPlanTier;

    // Set plan-based subscription license expiry
    const licenseExpiresAt = new Date();
    if (mappedPlanType === 'TRIAL') {
      licenseExpiresAt.setDate(licenseExpiresAt.getDate() + 10); // 10 Days Exploration Free Tier
    } else if (mappedPlanType === 'SILVER' || mappedPlanType === 'GOLD' || mappedPlanType === 'PLATINUM') {
      licenseExpiresAt.setDate(licenseExpiresAt.getDate() + 30); // Monthly (30 Days)
    } else if (mappedPlanType === 'LIFETIME') {
      licenseExpiresAt.setFullYear(licenseExpiresAt.getFullYear() + 100); // Lifetime Access (Offline/Manual)
    }
    
    // Generate the full login URL dynamically based on environment
    const hostHeader = req.headers.host || req.headers.origin || '';
    const isLocalhost = hostHeader.includes('localhost') || hostHeader.includes('127.0.0.1') || process.env.NODE_ENV?.toUpperCase() === 'LOCALHOST';
    const frontendDomain = isLocalhost ? 'localhost:3001' : (process.env.FRONTEND_DOMAIN || 'transitnode.prohitcoretech.com');
    const protocol = isLocalhost ? 'http' : 'https';
    const fullLoginUrl = `${protocol}://${customSubdomain}.${frontendDomain}/login`;

    const newTenant = new Tenant({
      companyName,
      registeredMobile,
      customSubdomain,
      fullLoginUrl,
      planType: mappedPlanType,
      licenseExpiresAt,
      paymentStatus: mappedPlanType === 'TRIAL' ? 'PAID' : 'PENDING',
      requireDriverMobileApp: requireDriverMobileApp || false,
      brandingOptions: {
        logoUrl: logoUrl || null,
        dominantHexColor: dominantHexColor || '#3b82f6',
      }
    });

    await newTenant.save();

    // Create the admin user
    let newAdmin;
    const magicToken = crypto.randomBytes(32).toString('hex');
    try {
      const bcrypt = require('bcrypt');
      const fallbackPassword = crypto.randomBytes(16).toString('hex'); // Long secure fallback
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(fallbackPassword, salt);
      
      const magicLinkExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      newAdmin = new User({
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
    } catch (userError) {
      // Clean up the created tenant so the subdomain isn't locked up
      await Tenant.deleteOne({ _id: newTenant._id });
      throw userError;
    }

    // If it's a FREE trial, send magic link and return success immediately
    if (mappedPlanType === 'TRIAL') {
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
        magicLink: `${protocol}://${customSubdomain}.${frontendDomain}/magic-login/${magicToken}`,
        fullLoginUrl: newTenant.fullLoginUrl
      });
    }

    // For paid plans, create Cashfree Order & record initial transaction
    let amount = 0;
    if (mappedPlanType === 'LIFETIME') amount = 450000;
    else if (mappedPlanType === 'PLATINUM') amount = 3999;
    else if (mappedPlanType === 'GOLD') amount = 2499;
    else if (mappedPlanType === 'SILVER') amount = 1499;

    // Save transaction record for Master Admin tracking
    try {
      const existingTx = await SubscriptionTransaction.findOne({ tenantId: newTenant._id });
      if (!existingTx) {
        await SubscriptionTransaction.create({
          tenantId: newTenant._id,
          planType: mappedPlanType,
          planNameAtPurchase: `${mappedPlanType} Plan`,
          amount: amount,
          amountPaid: amount,
          currency: 'INR',
          paymentMethod: 'CASHFREE_GATEWAY',
          createdAt: newTenant.createdAt || new Date()
        });
      }
    } catch (txErr) {
      console.error('[registerTenant] Transaction log notice:', txErr.message);
    }

    const { createCashfreeOrder } = require('../config/cashfree');
    const orderId = `order_tenant_${newTenant._id}`;
    
    const returnUrl = `${protocol}://${customSubdomain}.${frontendDomain}/setup-admin?payment_success=true`;

    try {
      const cfOrder = await createCashfreeOrder(
        orderId, 
        amount, 
        {
          id: newTenant._id.toString(),
          phone: registeredMobile,
          name: companyName,
          email: `admin@${customSubdomain}.prohitcoretech.in`,
          subdomain: customSubdomain
        }, 
        returnUrl
      );

      return res.status(201).json({
        message: 'Tenant registration initiated. Complete payment to activate workspace.',
        tenantId: newTenant._id,
        orderSessionId: cfOrder.payment_session_id,
        cfOrderId: cfOrder.order_id,
        requiresPayment: true
      });
    } catch (cfError) {
      console.error('Cashfree order creation failed:', cfError.message);
      
      // Development/Local Fallback: If Cashfree fails or keys are missing in local mode, still return requiresPayment: true
      if (process.env.NODE_ENV === 'localhost' || !process.env.CASHFREE_CLIENT_ID) {
        console.log(`[DEV MODE] Created tenant ${newTenant.companyName}. Proceeding to Payment Integration step.`);

        return res.status(201).json({
          message: 'Tenant workspace created. Complete payment integration.',
          tenantId: newTenant._id,
          subdomain: customSubdomain,
          requiresPayment: true,
          isSimulatedPayment: true,
          fullLoginUrl: newTenant.fullLoginUrl
        });
      }

      // Clean up the created tenant so they can try again with the same subdomain
      await User.deleteOne({ _id: newAdmin._id });
      await Tenant.deleteOne({ _id: newTenant._id });
      return res.status(500).json({ error: `Payment gateway initialization failed: ${cfError.message}` });
    }
  } catch (error) {
    console.error('Error in registerTenant:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.cashfreeWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-webhook-signature'];
    const timestamp = req.headers['x-webhook-timestamp'];
    const rawBody = req.rawBody;

    if (!verifyWebhookSignature(signature, timestamp, rawBody)) {
      console.error('[CASHFREE WEBHOOK] Invalid webhook signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const { event, data } = req.body;
    console.log(`[CASHFREE WEBHOOK] Event received: ${event}`);

    if (event === 'ORDER_PAID') {
      const orderId = data.order.order_id;
      const amount = data.order.order_amount;
      const paymentMethod = data.payment?.payment_method ? Object.keys(data.payment.payment_method)[0] : 'unknown';

      if (orderId && orderId.startsWith('order_tenant_')) {
        const tenantId = orderId.replace('order_tenant_', '');
        const tenant = await Tenant.findById(tenantId);
        
        if (tenant && tenant.paymentStatus !== 'PAID') {
          // Calculate license expiration based on plan
          const licenseExpiresAt = new Date();
          if (tenant.planType === 'LIFETIME') {
            licenseExpiresAt.setFullYear(licenseExpiresAt.getFullYear() + 100);
          } else if (tenant.planType === 'PLATINUM' || tenant.planType === 'SILVER') {
            licenseExpiresAt.setDate(licenseExpiresAt.getDate() + 30);
          }

          tenant.paymentStatus = 'PAID';
          tenant.licenseExpiresAt = licenseExpiresAt;
          await tenant.save();

          // Record Transaction with deduplication (30 minute window)
          const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
          const existingTx = await SubscriptionTransaction.findOne({
            tenantId: tenant._id,
            createdAt: { $gte: thirtyMinsAgo }
          });

          if (existingTx) {
            existingTx.amount = amount || existingTx.amount;
            existingTx.paymentMethod = `CASHFREE_${paymentMethod.toUpperCase()}`;
            await existingTx.save();
          } else {
            const transaction = new SubscriptionTransaction({
              tenantId: tenant._id,
              planType: tenant.planType,
              amount: amount,
              paymentMethod: `CASHFREE_${paymentMethod.toUpperCase()}`
            });
            await transaction.save();
          }
          
          console.log(`[CASHFREE WEBHOOK] Tenant ${tenant.companyName} marked as PAID. Plan: ${tenant.planType}`);
        }
      }
    }

    return res.status(200).send('OK');
  } catch (error) {
    console.error('Error in cashfreeWebhook:', error);
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

    // Auto-fix for LIFETIME plan if expiry was set to an old date or payment status was PENDING
    if (tenant.planType === 'LIFETIME') {
      let needsSave = false;
      const farFuture = new Date();
      farFuture.setFullYear(farFuture.getFullYear() + 100);
      
      if (!tenant.licenseExpiresAt || new Date(tenant.licenseExpiresAt) < new Date()) {
        tenant.licenseExpiresAt = farFuture;
        needsSave = true;
      }
      if (tenant.paymentStatus !== 'PAID') {
        tenant.paymentStatus = 'PAID';
        needsSave = true;
      }
      if (needsSave) {
        await tenant.save();
      }
    }

    // If payment status is PENDING and it is a paid non-lifetime plan, check Cashfree order directly (fallback/local development)
    if (tenant.paymentStatus === 'PENDING' && tenant.planType !== 'TRIAL' && tenant.planType !== 'LIFETIME') {
      try {
        const { getCashfreeOrder } = require('../config/cashfree');
        const orderId = `order_tenant_${tenant._id}`;
        const cfOrder = await getCashfreeOrder(orderId);
        
        if (cfOrder && cfOrder.order_status === 'PAID') {
          const licenseExpiresAt = new Date();
          if (tenant.planType === 'PLATINUM' || tenant.planType === 'SILVER') {
            licenseExpiresAt.setDate(licenseExpiresAt.getDate() + 30);
          }

          tenant.paymentStatus = 'PAID';
          tenant.licenseExpiresAt = licenseExpiresAt;
          await tenant.save();

          // Create the SubscriptionTransaction record if it doesn't exist
          const SubscriptionTransaction = require('../models/NoSQL/SubscriptionTransaction');
          const existingTx = await SubscriptionTransaction.findOne({ tenantId: tenant._id });
          if (!existingTx) {
            let paymentMethod = 'unknown';
            try {
              const { getCashfreeOrderPayments } = require('../config/cashfree');
              const payments = await getCashfreeOrderPayments(orderId);
              const successPayment = payments && payments.find ? payments.find(p => p.payment_status === 'SUCCESS') : null;
              if (successPayment && successPayment.payment_method) {
                paymentMethod = Object.keys(successPayment.payment_method)[0] || 'unknown';
              }
            } catch (payError) {
              console.error(`[GET PROFILE FALLBACK] Failed to check Cashfree payments list:`, payError.message);
            }
            
            const transaction = new SubscriptionTransaction({
              tenantId: tenant._id,
              planType: tenant.planType,
              amount: cfOrder.order_amount,
              paymentMethod: `CASHFREE_${paymentMethod.toUpperCase()}`
            });
            await transaction.save();
          }

          console.log(`[GET PROFILE FALLBACK] Tenant ${tenant.companyName} dynamically marked as PAID via Cashfree API check.`);
        }
      } catch (cfError) {
        console.error(`[GET PROFILE FALLBACK] Failed to check Cashfree order status for tenant ${tenant._id}:`, cfError.message);
      }
    }

    // Verify license status
    const now = new Date();
    if (tenant.isSuspended) {
      return res.status(403).json({ error: 'Tenant subscription has expired or is suspended. Please contact administrator.' });
    }
    if (tenant.planType !== 'LIFETIME' && tenant.licenseExpiresAt && tenant.licenseExpiresAt < now) {
      return res.status(403).json({ error: 'Tenant subscription has expired or is suspended. Please contact administrator.' });
    }

    return res.status(200).json({
      tenantId: tenant._id,
      companyName: tenant.companyName,
      customSubdomain: tenant.customSubdomain,
      planType: tenant.planType,
      paymentStatus: tenant.paymentStatus,
      adminSetupComplete: tenant.adminSetupComplete,
      enableLiveFleetMap: tenant.enableLiveFleetMap !== false,
      enableFinancialEngine: tenant.enableFinancialEngine !== false,
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
    } else if (tenant.planType === 'PLATINUM' || tenant.planType === 'SILVER') {
      licenseExpiresAt.setDate(licenseExpiresAt.getDate() + 30);
    } else {
      // Default to +30 days if somehow checkout is hit for a free trial
      licenseExpiresAt.setDate(licenseExpiresAt.getDate() + 30);
    }

    // Update Tenant
    tenant.paymentStatus = 'PAID';
    tenant.licenseExpiresAt = licenseExpiresAt;
    await tenant.save();

    // Record Transaction with deduplication (30 minute window)
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
    const existingTx = await SubscriptionTransaction.findOne({
      tenantId: tenant._id,
      createdAt: { $gte: thirtyMinsAgo }
    });

    if (existingTx) {
      existingTx.amount = amount || existingTx.amount;
      existingTx.paymentMethod = paymentMethod || existingTx.paymentMethod;
      await existingTx.save();
    } else {
      const transaction = new SubscriptionTransaction({
        tenantId: tenant._id,
        planType: tenant.planType,
        amount: amount || 0,
        paymentMethod: paymentMethod || 'unknown'
      });
      await transaction.save();
    }

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
    
    const { companyName, gstin, pan, address, state, stateCode, contactNumber, logoUrl, dominantHexColor, requireDriverMobileApp } = req.body;

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
    if (requireDriverMobileApp !== undefined) {
      // Need to convert string 'true'/'false' to boolean since FormData sends strings
      tenant.requireDriverMobileApp = requireDriverMobileApp === 'true' || requireDriverMobileApp === true;
    }
    
    // Update brandingOptions if provided
    if (req.file || logoUrl !== undefined || dominantHexColor !== undefined) {
      tenant.brandingOptions = tenant.brandingOptions || {};
      if (req.file) {
        tenant.brandingOptions.logoUrl = `/uploads/${req.file.filename}`;
      } else if (logoUrl !== undefined) {
        tenant.brandingOptions.logoUrl = logoUrl || null;
      }
      if (dominantHexColor !== undefined) {
        tenant.brandingOptions.dominantHexColor = dominantHexColor || '#3b82f6';
      }
    }

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

// GET /api/saas/plans (Public)
exports.getPublicSubscriptionPlans = async (req, res) => {
  try {
    let plans = await SubscriptionPlan.find({ isActive: true, planKey: { $ne: 'LIFETIME' } }).sort({ price: 1, createdAt: 1 });
    if (plans.length === 0) {
      // Return hardcoded default structures if not seeded yet
      plans = [
        {
          planKey: 'TRIAL',
          title: '10 Day Exploration',
          badgeText: 'TRANCEZARDS',
          tagline: 'Start exploring all transit management capabilities.',
          price: 0,
          originalPrice: 0,
          currency: 'INR',
          priceDisplay: '₹0',
          durationDays: 10,
          durationLabel: '10 Days',
          features: [
            'Up to 2 Vehicles & Fleet Assets',
            '1 Admin User Account',
            '1 Primary Workspace',
            'Basic Billing & Invoicing'
          ],
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
          price: 1499,
          originalPrice: 1999,
          currency: 'INR',
          priceDisplay: '₹1,499/mo',
          durationDays: 30,
          durationLabel: '1 Month',
          features: [
            'Up to 15 Vehicles & Fleet Assets',
            'Up to 3 Team Users',
            '1 Primary Workspace',
            'Live GPS & Telemetry Tracking',
            'Trip & Daily Runsheet Engine',
            'Financial Ledger & Expense Tracking',
            'Standard Client & Vendor Rate Cards'
          ],
          buttonText: 'Upgrade Monthly',
          accentColor: 'emerald',
          isPopular: false,
          isActive: true
        },
        {
          planKey: 'GOLD',
          title: 'Gold Plan',
          badgeText: 'TRANCEZARDS',
          tagline: 'Optimized for expanding fleets & automated compliance.',
          price: 2499,
          originalPrice: 3299,
          currency: 'INR',
          priceDisplay: '₹2,499/mo',
          durationDays: 30,
          durationLabel: '1 Month',
          features: [
            'Up to 30 Vehicles & Fleet Assets',
            'Up to 6 Team Users',
            'Up to 2 Sister Companies & Workspaces',
            'Live GPS & Telemetry Tracking',
            'Automated Compliance Vault Alerts',
            'Financial Ledger & Advanced Expense Tracking',
            'Standard & Vendor Rate Cards Engine',
            'Priority Support (12h SLA)'
          ],
          buttonText: 'Upgrade Monthly',
          accentColor: 'amber',
          isPopular: true,
          isActive: true
        },
        {
          planKey: 'PLATINUM',
          title: 'Platinum Plan',
          badgeText: 'TRANCEZARDS',
          tagline: 'Enterprise logistics with multi-company management.',
          price: 3999,
          originalPrice: 4999,
          currency: 'INR',
          priceDisplay: '₹3,999/mo',
          durationDays: 30,
          durationLabel: '1 Month',
          features: [
            'Up to 50 Vehicles & Fleet Assets',
            'Up to 10 Team Users',
            'Up to 5 Sister Companies & Workspaces',
            'Live GPS & Telemetry Tracking',
            'Automated Compliance Vault Alerts',
            'Driver Mobile App Access',
            'Custom PDF Invoice Template Engine',
            'Advanced Rate Cards & Route Analytics'
          ],
          buttonText: 'Upgrade Monthly',
          accentColor: 'purple',
          isPopular: false,
          isActive: true
        }
      ];
    }
    // Always ensure LIFETIME is excluded from public online plans
    plans = plans.filter(p => p.planKey !== 'LIFETIME');
    return res.status(200).json({ success: true, plans });
  } catch (error) {
    console.error('getPublicSubscriptionPlans error:', error);
    return res.status(500).json({ error: 'Failed to load subscription plans' });
  }
};

// POST /api/saas/validate-coupon (Public)
exports.validateCoupon = async (req, res) => {
  try {
    const { code, planKey, amount } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }

    const cleanCode = code.trim().toUpperCase();
    const coupon = await Coupon.findOne({ code: cleanCode, isActive: true });

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid or expired coupon code' });
    }

    // Check expiration
    if (coupon.validUntil && new Date(coupon.validUntil) < new Date()) {
      return res.status(400).json({ success: false, message: 'This coupon code has expired' });
    }

    // Check max redemptions
    if (coupon.maxRedemptions !== null && coupon.timesRedeemed >= coupon.maxRedemptions) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit has been reached' });
    }

    // Check plan eligibility
    const upperPlan = (planKey || '').toUpperCase();
    if (coupon.applicablePlans && !coupon.applicablePlans.includes('ALL') && !coupon.applicablePlans.includes(upperPlan)) {
      return res.status(400).json({ success: false, message: `Coupon is not valid for ${planKey || 'this'} plan` });
    }

    const baseAmount = Number(amount) || 0;
    if (baseAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Coupon cannot be applied to free tier' });
    }

    if (coupon.minOrderAmount > 0 && baseAmount < coupon.minOrderAmount) {
      return res.status(400).json({ success: false, message: `Minimum plan value of ₹${coupon.minOrderAmount} required for this coupon` });
    }

    let discountAmount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = (baseAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    if (discountAmount > baseAmount) {
      discountAmount = baseAmount;
    }

    const finalAmount = Math.max(0, baseAmount - discountAmount);

    return res.status(200).json({
      success: true,
      message: `Coupon '${coupon.code}' applied successfully!`,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        description: coupon.description
      },
      discountAmount,
      finalAmount
    });
  } catch (error) {
    console.error('validateCoupon error:', error);
    return res.status(500).json({ success: false, message: 'Failed to validate coupon code' });
  }
};

exports.getPublicTestimonials = async (req, res) => {
  try {
    const Testimonial = require('../models/NoSQL/Testimonial');
    const count = await Testimonial.countDocuments();
    if (count === 0) {
      const DEFAULT_TESTIMONIALS = [
        {
          name: 'Anis S.',
          role: 'Head of Operations, Indigo',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
          quote: 'TransitNode simplified our fleet operations and automated invoicing across regional routes efficiently.',
          rating: 5,
          isActive: true,
          order: 1
        },
        {
          name: 'Vikram Mehta',
          role: 'Managing Director, Apex Logistics',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
          quote: 'The real-time telemetry and compliance vault cut down our administrative overhead by more than 40%.',
          rating: 5,
          isActive: true,
          order: 2
        },
        {
          name: 'Priya Sharma',
          role: 'VP Supply Chain, Transport Core',
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
          quote: 'Managing multi-company workspaces with automated rate cards has never been this seamless.',
          rating: 5,
          isActive: true,
          order: 3
        }
      ];
      await Testimonial.insertMany(DEFAULT_TESTIMONIALS);
    }

    const all = await Testimonial.find().sort({ createdAt: -1, _id: -1 });
    const top10Ids = all.slice(0, 10).map((t) => t._id);
    const olderIds = all.slice(10).map((t) => t._id);

    if (top10Ids.length > 0) {
      await Testimonial.updateMany({ _id: { $in: top10Ids } }, { $set: { isActive: true } });
    }
    if (olderIds.length > 0) {
      await Testimonial.updateMany({ _id: { $in: olderIds } }, { $set: { isActive: false } });
    }

    const testimonials = await Testimonial.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(10);
    return res.status(200).json({ success: true, testimonials });
  } catch (error) {
    console.error('getPublicTestimonials error:', error);
    return res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
};

