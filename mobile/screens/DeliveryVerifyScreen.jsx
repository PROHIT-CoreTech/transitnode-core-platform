import React, { useState } from 'react';
import TouchButton from '../components/Common/TouchButton';

// Geofence-unlocked 6-digit verification code form entry pad
const DeliveryVerifyScreen = () => {
  const [otp, setOtp] = useState('');

  const handleVerify = () => {
    // Verify OTP logic
  };

  return (
    <div className="p-6 h-full flex flex-col justify-center bg-gray-900">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📍</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Destination Reached</h2>
        <p className="text-gray-400">Ask the Gate Clerk for the 6-digit OTP to complete the trip.</p>
      </div>

      <input
        type="number"
        className="w-full bg-gray-800 text-white rounded-xl px-5 py-4 border border-gray-700 mb-8 text-center text-3xl tracking-[0.5em]"
        maxLength={6}
        placeholder="------"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
      />
      <TouchButton onClick={handleVerify} variant="primary" className="bg-green-600 hover:bg-green-500">
        Verify Delivery
      </TouchButton>
    </div>
  );
};

export default DeliveryVerifyScreen;
