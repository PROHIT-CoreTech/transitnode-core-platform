const crypto = require('crypto');

const CASHFREE_CLIENT_ID = process.env.CASHFREE_CLIENT_ID || '';
const CASHFREE_CLIENT_SECRET = process.env.CASHFREE_CLIENT_SECRET || '';
const CASHFREE_ENV = process.env.CASHFREE_ENV || 'sandbox';
const CASHFREE_WEBHOOK_SECRET = process.env.CASHFREE_WEBHOOK_SECRET || '';

const getBaseUrl = () => {
  return CASHFREE_ENV === 'production' 
    ? 'https://api.cashfree.com/pg' 
    : 'https://sandbox.cashfree.com/pg';
};

/**
 * Creates a Cashfree order for tenant registration payment
 * @param {string} orderId Unique identifier for this order (e.g. order_tenant_123)
 * @param {number} amount Amount to charge in INR
 * @param {object} customer Customer details (id, name, email, phone)
 * @param {string} returnUrl Redirect url after payment completion
 */
const createCashfreeOrder = async (orderId, amount, customer, returnUrl) => {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/orders`;

  const payload = {
    order_id: orderId,
    order_amount: parseFloat(amount).toFixed(2),
    order_currency: 'INR',
    customer_details: {
      customer_id: customer.id,
      customer_phone: customer.phone,
      customer_name: customer.name || 'Tenant Admin',
      customer_email: customer.email || `admin@${customer.subdomain}.prohitcoretech.in`
    },
    order_meta: {
      return_url: returnUrl
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'x-api-version': '2023-08-01',
      'x-client-id': CASHFREE_CLIENT_ID,
      'x-client-secret': CASHFREE_CLIENT_SECRET,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create order on Cashfree');
  }

  return await response.json();
};

/**
 * Verifies the Cashfree webhook signature
 * @param {string} signature Header x-webhook-signature
 * @param {string} timestamp Header x-webhook-timestamp
 * @param {string} rawBody Raw string body of the request
 */
const verifyWebhookSignature = (signature, timestamp, rawBody) => {
  if (!signature || !timestamp || !rawBody || !CASHFREE_WEBHOOK_SECRET) {
    return false;
  }
  const text = timestamp + rawBody;
  const hmac = crypto.createHmac('sha256', CASHFREE_WEBHOOK_SECRET);
  hmac.update(text);
  const calculatedSignature = hmac.digest('base64');
  return calculatedSignature === signature;
};

/**
 * Fetches the order status from Cashfree API to verify payment
 * @param {string} orderId The order ID to check
 */
const getCashfreeOrder = async (orderId) => {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/orders/${orderId}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'x-api-version': '2023-08-01',
      'x-client-id': CASHFREE_CLIENT_ID,
      'x-client-secret': CASHFREE_CLIENT_SECRET,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch order from Cashfree');
  }

  return await response.json();
};

/**
 * Fetches the payments list for a specific order from Cashfree API
 * @param {string} orderId The order ID to check
 */
const getCashfreeOrderPayments = async (orderId) => {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/orders/${orderId}/payments`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'x-api-version': '2023-08-01',
      'x-client-id': CASHFREE_CLIENT_ID,
      'x-client-secret': CASHFREE_CLIENT_SECRET,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch order payments from Cashfree');
  }

  return await response.json();
};

module.exports = {
  CASHFREE_CLIENT_ID,
  CASHFREE_ENV,
  createCashfreeOrder,
  verifyWebhookSignature,
  getCashfreeOrder,
  getCashfreeOrderPayments
};
