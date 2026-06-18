import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';

const ConsolidatedInvoiceModal = ({ invoice, onClose }) => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const token = localStorage.getItem('token');
        // We can just fetch the shipments or pass them from the parent. 
        // We'll hit the standard GET /api/shipments endpoint and filter, or we can just fetch the data.
        // Actually, since this is a summary, we can just print the master invoice stats.
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchShipments();
  }, [invoice]);

  if (!invoice) return null;

  const content = (
    <div className="bg-white p-8 w-[210mm] min-h-[297mm] mx-auto text-black font-sans shadow-lg print:shadow-none print:m-0 print:p-0">
      <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-6">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tighter">TRANSIT<span className="text-[#00a651]">NODE</span></h1>
          <p className="text-sm font-medium text-gray-500 mt-1">Master Invoice / Consolidated Billing</p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">{invoice.invoiceId}</h2>
          <p className="text-sm text-gray-500 font-mono">Date: {new Date(invoice.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-12 mb-8">
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Billed To</h3>
          <p className="text-lg font-bold text-gray-800">{invoice.supplierName}</p>
          <p className="text-sm text-gray-600 mt-1">Total Shipments: {invoice.shipmentIds.length}</p>
          <p className="text-sm text-gray-600 mt-1">Status: <span className="font-bold">{invoice.status}</span></p>
        </div>
        <div className="text-right">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Payment Info</h3>
          <p className="text-sm text-gray-600 mt-1">Payment Method: {invoice.paymentMethod || 'PENDING'}</p>
        </div>
      </div>

      <table className="w-full text-left border-collapse mb-8">
        <thead>
          <tr className="border-b-2 border-gray-800">
            <th className="py-3 font-bold text-sm text-gray-800">Description</th>
            <th className="py-3 font-bold text-sm text-gray-800 text-right">Amount (INR)</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-200">
            <td className="py-4 text-sm text-gray-700">Consolidated Freight Charges ({invoice.shipmentIds.length} shipments)</td>
            <td className="py-4 text-sm font-mono text-gray-800 text-right">₹{invoice.financials.subtotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
          </tr>
          <tr className="border-b border-gray-200">
            <td className="py-4 text-sm text-gray-700">Tax (GST)</td>
            <td className="py-4 text-sm font-mono text-gray-800 text-right">₹{invoice.financials.taxAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
          </tr>
        </tbody>
      </table>

      <div className="flex justify-end mb-12">
        <div className="w-1/2">
          <div className="flex justify-between py-3 border-t-2 border-gray-800 bg-gray-50 px-4">
            <span className="font-bold text-gray-800">Grand Total</span>
            <span className="font-bold text-2xl font-mono text-[#00a651]">₹{invoice.financials.grandTotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
          </div>
        </div>
      </div>

      <div className="text-center text-sm text-gray-500 mt-12 pt-8 border-t border-gray-200">
        <p>This is a computer generated master invoice and does not require a signature.</p>
        <p className="mt-1">For detailed shipment breakdown, please refer to the attached Excel Export.</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4 print:static print:p-0 print:block print:bg-transparent">
      <div className="bg-gray-100 text-black rounded-lg shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col relative print:static print:overflow-visible print:max-w-none print:shadow-none print:w-full print:bg-white">
        
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white print:hidden">
          <h2 className="text-xl font-bold text-gray-800">Print Master Invoice</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 print:p-0 print:overflow-visible print:bg-white">
          <div className="bg-white shadow-md mx-auto max-w-full overflow-hidden print:hidden" style={{ transform: 'scale(0.9)', transformOrigin: 'top center' }}>
            {content}
          </div>
        </div>

        {createPortal(
          <div className="hidden print:block absolute inset-0 bg-white printable-portal">
            {content}
          </div>,
          document.body
        )}

        <div className="px-6 py-4 bg-white border-t border-gray-200 flex justify-end gap-4 print:hidden shrink-0">
          <button onClick={onClose} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium transition-colors">Cancel</button>
          <button 
            onClick={() => {
              const originalTitle = document.title;
              document.title = `TNE_MASTER_${invoice.invoiceId}_${invoice.supplierName}`;
              window.print();
              document.title = originalTitle;
            }}
            className="px-6 py-2 bg-[#00a651] text-white rounded-md hover:bg-[#008f45] font-bold shadow-md hover:shadow-lg transition-all"
          >
            Print Master Invoice
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsolidatedInvoiceModal;
