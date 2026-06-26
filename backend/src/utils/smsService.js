/**
 * Mock SMS Service
 * Simulates the dispatch of tracking alerts to consignees.
 */

const sendConsigneeTrackingAlert = async (shipmentId, phone, vehicleNumber, otp) => {
  try {
    // In a production environment, this would integrate with Twilio, AWS SNS, Fast2SMS, etc.
    const message = `Shipment Alert: Vehicle ${vehicleNumber} is arriving soon! Your delivery verification OTP is ${otp}. Please share this with the driver.`;
    
    console.log('\n======================================================');
    console.log('MOCK SMS DISPATCHED');
    console.log(`TO: ${phone}`);
    console.log(`SHIPMENT ID: ${shipmentId}`);
    console.log(`MESSAGE: ${message}`);
    console.log('======================================================\n');

    return { success: true, message: 'SMS dispatched successfully' };
  } catch (error) {
    console.error('Failed to send consignee tracking alert:', error);
    // Depending on requirements, we could rethrow or fail silently
    throw error;
  }
};

module.exports = {
  sendConsigneeTrackingAlert
};
