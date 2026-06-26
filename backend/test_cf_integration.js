const mongoose = require('mongoose');
const crypto = require('crypto');

// Load environment variables
require('dotenv').config();

const Tenant = require('./src/models/NoSQL/Tenant');
const SubscriptionTransaction = require('./src/models/NoSQL/SubscriptionTransaction');
const saasController = require('./src/controllers/saasController');

async function runTest() {
  try {
    // 1. Connect to MongoDB
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.');

    // 2. Clean up and provision a temporary unpaid tenant
    console.log('Cleaning up existing test tenants...');
    await Tenant.deleteMany({ customSubdomain: 'test-cf-subdomain' });
    await SubscriptionTransaction.deleteMany({ paymentMethod: /^CASHFREE_/ });

    console.log('Provisioning new unpaid test tenant...');
    const tenant = new Tenant({
      companyName: 'Test Cashfree Company',
      registeredMobile: '9999999999',
      customSubdomain: 'test-cf-subdomain',
      planType: 'SILVER',
      licenseExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day grace
      paymentStatus: 'PENDING'
    });
    await tenant.save();
    console.log('Tenant created with ID:', tenant._id.toString());
    console.log('Initial Payment Status:', tenant.paymentStatus);
    console.log('Initial License Expiry:', tenant.licenseExpiresAt);

    // 3. Prepare Cashfree Webhook Mock Request
    const secretKey = process.env.CASHFREE_WEBHOOK_SECRET || 'test_webhook_secret';
    const orderId = `order_tenant_${tenant._id.toString()}`;
    const payload = {
      event: 'ORDER_PAID',
      data: {
        order: {
          order_id: orderId,
          order_amount: 50000.00
        },
        payment: {
          payment_id: 'cf_pay_test_98765',
          payment_status: 'SUCCESS',
          payment_method: {
            upi: {
              upi_id: 'customer@upi'
            }
          }
        }
      }
    };

    const rawBody = JSON.stringify(payload);
    const timestamp = Date.now().toString();
    const text = timestamp + rawBody;

    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(text);
    const signature = hmac.digest('base64');

    // Mock Express Request and Response
    const req = {
      headers: {
        'x-webhook-signature': signature,
        'x-webhook-timestamp': timestamp
      },
      rawBody: rawBody,
      body: payload
    };

    const res = {
      statusCode: 200,
      body: null,
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      send: function(msg) {
        this.body = msg;
        return this;
      },
      json: function(data) {
        this.body = data;
        return this;
      }
    };

    // 4. Invoke Webhook Controller directly
    console.log('Invoking saasController.cashfreeWebhook directly...');
    await saasController.cashfreeWebhook(req, res);

    console.log('Webhook Response Status Code:', res.statusCode);
    console.log('Webhook Response Body:', res.body);

    // 5. Query and Verify DB Changes
    console.log('Querying database to verify updates...');
    const updatedTenant = await Tenant.findById(tenant._id);
    
    console.log('--- VERIFICATION RESULTS ---');
    console.log('Final Payment Status (Expected: PAID):', updatedTenant.paymentStatus);
    
    const expectedExpiry = new Date();
    expectedExpiry.setFullYear(expectedExpiry.getFullYear() + 3); // Silver is 3 years
    console.log('Final License Expiry:', updatedTenant.licenseExpiresAt);
    
    const timeDifferenceHours = Math.abs(updatedTenant.licenseExpiresAt - expectedExpiry) / 36e5;
    console.log('Expiry matches expected (+3 years)?', timeDifferenceHours < 1 ? 'YES' : 'NO');

    // Check transaction record
    const transaction = await SubscriptionTransaction.findOne({ tenantId: tenant._id });
    if (transaction) {
      console.log('Subscription Transaction recorded? YES');
      console.log('Transaction Amount:', transaction.amount);
      console.log('Transaction Plan:', transaction.planType);
      console.log('Transaction Payment Method:', transaction.paymentMethod);
    } else {
      console.log('Subscription Transaction recorded? NO');
    }

    // Clean up
    console.log('Cleaning up database...');
    await Tenant.findByIdAndDelete(tenant._id);
    if (transaction) {
      await SubscriptionTransaction.findByIdAndDelete(transaction._id);
    }
    console.log('Cleanup finished.');

  } catch (err) {
    console.error('Test execution failed:', err);
  } finally {
    await mongoose.connect(process.env.MONGO_URI).then(() => mongoose.connection.close());
    console.log('Database connection closed.');
  }
}

runTest();
