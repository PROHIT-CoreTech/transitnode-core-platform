const jwt = require('jsonwebtoken');

const JWT_SECRET = '30aa4ff00c861e370b4a9bb0c46284ae41962afc2a693cb2866067aae4ed96b7';

// Generate token for an ACCOUNTANT user
const token = jwt.sign({ id: 'test-accountant-id', role: 'ACCOUNTANT', tenantId: '6570c0cbf9b1b11111111111' }, JWT_SECRET, { expiresIn: '1h' });

const payload = {
  baseFreightRate: 75000,
  driverAdvanceCash: 0,
  fuelVoucherAmount: 0,
  tollAllowance: 0,
  rcmApplied: false,
  gstAmount: 9018,
  grandTotalToClient: 84018,
  paymentMethod: 'SYSTEM',
  processingCharge: 150,
  fuelSurcharge: 0,
  rovCharge: 0,
  fodCharge: 0,
  handlingCharge: 0,
  codDodCharge: 0,
  specialDeliveryCharge: 0,
  otherCharges: 0,
  paymentType: 'CREDIT',
  modeOfPayment: 'NEFT_RTGS',
  chequeNeftNo: '',
  bankName: 'HDFC Bank Ltd'
};

async function test() {
  try {
    const response = await fetch('http://localhost:3000/api/invoices/settle/TR-2026-62891', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const status = response.status;
    const body = await response.text();
    console.log(`Response Status: ${status}`);
    console.log(`Response Body: ${body}`);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

test();
