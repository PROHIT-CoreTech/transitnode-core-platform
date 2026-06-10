import React from 'react';
import InvoiceTemplate from './InvoiceTemplate';

const ShippingLabelModal = ({ shipment, onClose }) => {
  if (!shipment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
      {/* Modal Container */}
      <div className="bg-white text-black rounded-lg shadow-2xl w-full max-w-lg overflow-hidden relative">
        
        {/* Header - Not printed */}
        <div className="bg-gray-100 px-6 py-4 flex justify-between items-center border-b border-gray-200 print:hidden">
          <h3 className="text-lg font-bold text-gray-800">Print Shipping Label</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 focus:outline-none"
          >
            ✕
          </button>
        </div>

        {/* The Label Area to be Printed */}
        <div id="printable-label" className="bg-white print:w-full print:h-full">
          <InvoiceTemplate data={shipment} />
        </div>

        {/* Footer Actions - Not printed */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-4 print:hidden">
          <button 
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              const originalTitle = document.title;
              document.title = `TNE_${shipment.trackingNumber}`;
              window.print();
              document.title = originalTitle;
            }}
            className="px-6 py-2 bg-green-600 text-white font-bold rounded shadow hover:bg-green-700 transition"
          >
            Print Label
          </button>
        </div>

      </div>
    </div>
  );
};

export default ShippingLabelModal;
