const http = require('http');

const data = JSON.stringify({
  companyName: "Test Corp",
  adminName: "Test Admin",
  email: "test@admin.com",
  mobileNumber: "9876543210",
  selectedPlan: "TRIAL"
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/master-admin/onboard-automated',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-master-admin-key': 'transitnode-master-key',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);
  res.on('data', d => {
    process.stdout.write(d);
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
