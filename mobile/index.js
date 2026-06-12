import React from 'react';
import { DriverAuthProvider } from './context/DriverAuthContext';
import { TripStateProvider } from './context/TripStateContext';
import LoginScreen from './screens/LoginScreen';

const MobileDriverApp = () => {
  return (
    <DriverAuthProvider>
      <TripStateProvider>
        <div className="mobile-app-container w-full h-screen bg-gray-900 text-white font-sans overflow-hidden">
          {/* Main entry registration point for the mobile workspace */}
          <LoginScreen />
        </div>
      </TripStateProvider>
    </DriverAuthProvider>
  );
};

export default MobileDriverApp;
