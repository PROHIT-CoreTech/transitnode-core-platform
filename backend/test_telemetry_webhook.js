const axios = require('axios');

async function testTelemetry() {
  try {
    const response = await axios.post('http://localhost:3000/api/telemetry/location', {
      vehicleId: 'MH01AB1234',
      lat: 19.0760,
      lng: 72.8777,
      speed: 40,
      heading: 90,
      ignition: true
    });
    console.log('Telemetry Response:', response.data);
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

testTelemetry();
