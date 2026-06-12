import React from 'react';
import DriverHeader from '../components/Layout/DriverHeader';
import TripTimelineStepper from '../components/Layout/TripTimelineStepper';
import TouchButton from '../components/Common/TouchButton';

// Active manifest layout displaying allocated driver advance
const DashboardScreen = () => {
  return (
    <div className="h-full flex flex-col bg-gray-900">
      <DriverHeader />
      <div className="p-4 flex-1 overflow-y-auto space-y-6">
        <TripTimelineStepper currentStatus="IN_TRANSIT" />
        
        <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
          <h3 className="text-gray-400 text-sm uppercase font-bold tracking-wider mb-4">Active Trip</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-gray-700 pb-3">
              <span className="text-gray-400">Destination</span>
              <span className="text-white font-semibold">Mumbai Terminal</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-700 pb-3">
              <span className="text-gray-400">Driver Advance</span>
              <span className="text-cyan-400 font-bold text-xl">₹5,000</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <TouchButton variant="secondary" className="text-sm py-6">
            ⛽ Scan Fuel Bill
          </TouchButton>
          <TouchButton variant="primary" className="text-sm py-6 bg-blue-600 hover:bg-blue-500">
            🗺️ Start Navigation
          </TouchButton>
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;
