import React, { useState, useEffect } from 'react';
import axios from 'axios';
import InvoiceModal from '../../components/InvoiceModal';
import ConsolidatedInvoiceModal from '../../components/ConsolidatedInvoiceModal';

const BillingDashboard = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  
  // Freight Calculation State
  const [baseFreightRate, setBaseFreightRate] = useState(45000);
  const [driverAdvanceCash, setDriverAdvanceCash] = useState(0);
  const [fuelVoucherAmount, setFuelVoucherAmount] = useState(0);
  const [tollAllowance, setTollAllowance] = useState(0);
  const [rcmApplied, setRcmApplied] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [processing, setProcessing] = useState(false);
  const [printData, setPrintData] = useState(null);
  const [printMasterInvoice, setPrintMasterInvoice] = useState(null);

  // Consolidated Billing State
  const [viewMode, setViewMode] = useState('DAILY'); // 'DAILY', 'MONTHLY_GEN', 'CONSOLIDATED'
  
  const [monthlySuppliers, setMonthlySuppliers] = useState([]);
  const [selectedMonthlySupplier, setSelectedMonthlySupplier] = useState(null);
  const [taxPercentage, setTaxPercentage] = useState(18);

  const [consolidatedInvoices, setConsolidatedInvoices] = useState([]);
  const [selectedConsolidated, setSelectedConsolidated] = useState(null);

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/invoices/pending', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setInvoices(res.data.invoices);
      setError('');
    } catch (err) {
      setError('Failed to load audit queue.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlySuppliers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/invoices/consolidated/suppliers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setMonthlySuppliers(res.data.suppliers || []);
    } catch (err) {
      console.error('Failed to fetch monthly suppliers:', err);
    }
  };

  const fetchConsolidatedInvoices = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/invoices/consolidated', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setConsolidatedInvoices(res.data.invoices);
    } catch (err) {
      console.error('Failed to fetch consolidated invoices:', err);
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchMonthlySuppliers();
    fetchConsolidatedInvoices();
  }, []);

  // Reset form inputs when a new shipment is selected
  useEffect(() => {
    if (selectedInvoice) {
      setBaseFreightRate(45000);
      setDriverAdvanceCash(0);
      setFuelVoucherAmount(0);
      setTollAllowance(0);
      setRcmApplied(false);
      setPaymentMethod('CASH');
    }
  }, [selectedInvoice]);

  // B2B Freight Calculation Utility
  const baseRate = Number(baseFreightRate) || 0;
  const gstRate = rcmApplied ? 0.05 : 0.18;
  const gstAmount = baseRate * gstRate;
  const cgst = gstAmount / 2;
  const sgst = gstAmount / 2;
  
  const grandTotal = baseRate + gstAmount;

  const handleSettle = async () => {
    if (!selectedInvoice) return;
    setProcessing(true);
    try {
      const payload = {
        baseFreightRate: baseRate,
        driverAdvanceCash: Number(driverAdvanceCash),
        fuelVoucherAmount: Number(fuelVoucherAmount),
        tollAllowance: Number(tollAllowance),
        rcmApplied,
        gstAmount,
        grandTotalToClient: grandTotal,
        paymentMethod
      };
      
      const token = localStorage.getItem('token');
      await axios.patch(`/api/invoices/settle/${selectedInvoice.trackingNumber}`, payload, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Save data for print
      setPrintData({
        ...selectedInvoice,
        calculated: {
          baseFreightRate: baseRate,
          driverAdvanceCash: Number(driverAdvanceCash),
          fuelVoucherAmount: Number(fuelVoucherAmount),
          tollAllowance: Number(tollAllowance),
          rcmApplied,
          cgst,
          sgst,
          gstAmount,
          grandTotal
        }
      });
      // Refresh queue after successful patch
      fetchInvoices();
      setSelectedInvoice(null);
    } catch (err) {
      console.error('Failed to settle invoice', err);
      alert('Settlement failed. Check inputs.');
    } finally {
      setProcessing(false);
    }
  };

  const handleMarkAsMonthly = async () => {
    if (!selectedInvoice) return;
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/invoices/monthly/${selectedInvoice.trackingNumber}`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchInvoices();
      fetchMonthlySuppliers();
      setSelectedInvoice(null);
    } catch (err) {
      console.error('Failed to mark as monthly', err);
      alert('Failed to mark shipment for monthly billing.');
    } finally {
      setProcessing(false);
    }
  };

  const handleGenerateConsolidated = async () => {
    if (!selectedMonthlySupplier) return;
    
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/invoices/consolidated', {
        supplierName: selectedMonthlySupplier.supplierName,
        taxPercentage: taxPercentage
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setSelectedMonthlySupplier(null);
      fetchMonthlySuppliers();
      fetchConsolidatedInvoices();
      setViewMode('CONSOLIDATED');
      alert('Master invoice generated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to generate master invoice.');
    } finally {
      setProcessing(false);
    }
  };

  const handleSettleConsolidated = async () => {
    if (!selectedConsolidated) return;
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/invoices/consolidated/${selectedConsolidated._id}/settle`, {
        paymentMethod
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setSelectedConsolidated(null);
      fetchConsolidatedInvoices();
      alert('Master invoice settled successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to settle master invoice.');
    } finally {
      setProcessing(false);
    }
  };

  const handleExportConsolidated = async () => {
    if (!selectedConsolidated) return;
    try {
      const token = localStorage.getItem('token');
      const url = `/api/invoices/consolidated/${selectedConsolidated._id}/export`;
      
      const res = await axios.get(url, {
        headers: { 'Authorization': `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `master_invoice_${selectedConsolidated.invoiceId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to export:', err);
      alert('Failed to generate Excel export.');
    }
  };

  return (
    <div className="mt-8 flex gap-6 h-[80vh]">
      
      {/* LEFT PANE: Audit Queue */}
      <div className="w-1/3 glass-panel p-6 flex flex-col h-full overflow-hidden">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h3 className="text-xl font-bold text-white">Billing Queue</h3>
            <div className="flex gap-2 mt-2">
              <button 
                onClick={() => setViewMode('DAILY')} 
                className={`text-[10px] px-3 py-1 rounded-full font-bold transition ${viewMode === 'DAILY' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}
              >
                Unbilled Daily
              </button>
              <button 
                onClick={() => setViewMode('MONTHLY_GEN')} 
                className={`text-[10px] px-3 py-1 rounded-full font-bold transition ${viewMode === 'MONTHLY_GEN' ? 'bg-yellow-600 text-white' : 'bg-gray-800 text-gray-400'}`}
              >
                EOM Generation
              </button>
              <button 
                onClick={() => setViewMode('CONSOLIDATED')} 
                className={`text-[10px] px-3 py-1 rounded-full font-bold transition ${viewMode === 'CONSOLIDATED' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}
              >
                Master Invoices
              </button>
            </div>
          </div>
        </div>
        
        {error && <div className="text-red-400 text-sm mb-4">{error}</div>}
        
        <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
          {loading ? (
            <div className="text-gray-500 text-sm animate-pulse">Loading ledgers...</div>
          ) : viewMode === 'DAILY' ? (
            invoices.length === 0 ? (
              <div className="text-gray-500 text-sm text-center mt-10">Queue is empty</div>
            ) : (
              <>
                {invoices.map(inv => (
                  <div 
                    key={inv.trackingNumber}
                    onClick={() => setSelectedInvoice(inv)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                      selectedInvoice?.trackingNumber === inv.trackingNumber 
                      ? 'bg-blue-900/40 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                      : 'bg-gray-800/40 border-gray-700/50 hover:bg-gray-700/50'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-mono text-sm font-bold text-blue-400">{inv.trackingNumber}</span>
                      <span className="text-[10px] bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded border border-yellow-500/30">PENDING</span>
                    </div>
                    <div className="text-xs text-gray-300 truncate font-bold">{inv.logistics?.receiver?.name || 'Unknown Supplier'}</div>
                    <div className="text-[10px] text-gray-400 mt-1">{inv.logistics?.transport?.origin} → {inv.logistics?.transport?.destination}</div>
                  </div>
                ))}
              </>
            )
          ) : viewMode === 'MONTHLY_GEN' ? (
            monthlySuppliers.length === 0 ? (
              <div className="text-gray-500 text-sm text-center mt-10">No pending monthly shipments</div>
            ) : (
              monthlySuppliers.map((sup, idx) => (
                <div 
                  key={idx}
                  onClick={() => setSelectedMonthlySupplier(sup)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                    selectedMonthlySupplier?.supplierName === sup.supplierName 
                    ? 'bg-yellow-900/40 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.2)]' 
                    : 'bg-gray-800/40 border-gray-700/50 hover:bg-gray-700/50'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-yellow-400">{sup.supplierName}</span>
                  </div>
                  <div className="text-xs text-gray-300">Pending Shipments: <span className="font-bold">{sup.shipmentCount}</span></div>
                  <div className="text-[10px] text-gray-400 mt-1">Est. Subtotal: ₹{sup.estimatedSubtotal.toLocaleString('en-IN')}</div>
                </div>
              ))
            )
          ) : (
            consolidatedInvoices.length === 0 ? (
              <div className="text-gray-500 text-sm text-center mt-10">No master invoices found</div>
            ) : (
              consolidatedInvoices.map(inv => (
                <div 
                  key={inv._id}
                  onClick={() => setSelectedConsolidated(inv)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                    selectedConsolidated?._id === inv._id 
                    ? 'bg-purple-900/40 border-purple-500/50 shadow-[0_0_15px_rgba(147,51,234,0.2)]' 
                    : 'bg-gray-800/40 border-gray-700/50 hover:bg-gray-700/50'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono text-sm font-bold text-purple-400">{inv.invoiceId}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded border ${inv.status === 'PAID' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'}`}>
                      {inv.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-300 truncate font-bold">{inv.supplierName}</div>
                  <div className="text-[10px] text-gray-400 mt-1">{inv.shipmentIds.length} Shipments | ₹{inv.financials.grandTotal.toLocaleString('en-IN')}</div>
                </div>
              ))
            )
          )}
        </div>
      </div>

      {/* RIGHT PANE: Calculation Workspace */}
      <div className="w-2/3 glass-panel p-6 flex flex-col h-full overflow-y-auto">
        {viewMode === 'DAILY' ? (
          !selectedInvoice ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
              <svg className="w-16 h-16 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <p>Select a single shipment to bill immediately, or select multiple checkboxes to generate a Master Invoice.</p>
            </div>
          ) : (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-start border-b border-gray-700/50 pb-4">
              <div>
                <h3 className="text-2xl font-bold text-white">Invoice Engine</h3>
                <p className="text-blue-400 font-mono mt-1">{selectedInvoice.trackingNumber}</p>
              </div>
              {/* Actions relocated to top */}
              <div className="flex gap-4">
                <button 
                  onClick={handleMarkAsMonthly}
                  disabled={processing}
                  className={`px-6 py-2 rounded-xl font-bold text-white transition-all duration-300 flex justify-center items-center gap-2 ${
                    processing 
                    ? 'bg-yellow-600/50 cursor-not-allowed' 
                    : 'bg-yellow-600 hover:bg-yellow-500 shadow-[0_0_20px_rgba(202,138,4,0.4)]'
                  }`}
                >
                  Mark for End-of-Month
                </button>

                <button 
                  onClick={handleSettle}
                  disabled={processing}
                  className={`px-6 py-2 rounded-xl font-bold text-white transition-all duration-300 flex justify-center items-center gap-2 ${
                    processing 
                    ? 'bg-blue-600/50 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.4)]'
                  }`}
                >
                  {processing ? 'Processing...' : 'Settle Now'}
                </button>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 gap-6">
              
              {/* Freight Financials */}
              <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/50 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-bold text-gray-400 tracking-wider">FREIGHT FINANCIALS</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500">RCM APPLIED (5%)</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={rcmApplied} onChange={() => setRcmApplied(!rcmApplied)} className="sr-only peer" />
                      <div className="w-9 h-5 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-bold">Base Freight Rate (₹)</span>
                  <input 
                    type="number" 
                    value={baseFreightRate}
                    onChange={e => setBaseFreightRate(e.target.value)}
                    className="w-32 bg-gray-900 border border-gray-600 rounded px-2 py-1 text-right focus:border-blue-500 focus:outline-none font-mono text-white text-lg font-bold"
                  />
                </div>
              </div>

              {/* Expense Editor */}
              <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/50 space-y-4">
                <h4 className="text-sm font-bold text-gray-400 tracking-wider">TRIP EXPENSES (DRIVER ALLOCATION)</h4>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Driver Advance Cash (₹)</span>
                  <input 
                    type="number" 
                    value={driverAdvanceCash}
                    onChange={e => setDriverAdvanceCash(e.target.value)}
                    className="w-24 bg-gray-900 border border-gray-600 rounded px-2 py-1 text-right focus:border-blue-500 focus:outline-none font-mono text-white"
                  />
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Fuel Voucher Amount (₹)</span>
                  <input 
                    type="number" 
                    value={fuelVoucherAmount}
                    onChange={e => setFuelVoucherAmount(e.target.value)}
                    className="w-24 bg-gray-900 border border-gray-600 rounded px-2 py-1 text-right focus:border-blue-500 focus:outline-none font-mono text-white"
                  />
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Toll Allocation (₹)</span>
                  <input 
                    type="number" 
                    value={tollAllowance}
                    onChange={e => setTollAllowance(e.target.value)}
                    className="w-24 bg-gray-900 border border-gray-600 rounded px-2 py-1 text-right focus:border-blue-500 focus:outline-none font-mono text-white"
                  />
                </div>
              </div>
            </div>

            {/* Grand Total Breakdown */}
            <div className="bg-[#0B0E14] p-5 rounded-xl border border-gray-700 shadow-inner space-y-3">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Taxable Amount (Base Freight)</span>
                <span className="font-mono">₹{baseRate.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-400">
                <span>CGST ({rcmApplied ? '2.5%' : '9%'})</span>
                <span className="font-mono">+ ₹{cgst.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-400">
                <span>SGST ({rcmApplied ? '2.5%' : '9%'})</span>
                <span className="font-mono">+ ₹{sgst.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
              <div className="border-t border-gray-700 pt-3 flex justify-between items-end">
                <span className="text-lg font-bold text-white">Grand Total</span>
                <span className="text-3xl font-mono font-bold text-green-400">₹{grandTotal.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/50 flex justify-between items-center">
              <span className="text-sm font-bold text-gray-400 tracking-wider">PAYMENT METHOD</span>
              <select 
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
                className="bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="CASH">Cash</option>
                <option value="UPI">UPI</option>
                <option value="CREDIT_CARD">Credit Card</option>
                <option value="NET_BANKING">Net Banking</option>
                <option value="CORPORATE_ACCOUNT">Corporate Account</option>
              </select>
            </div>


          </div>
          )
        ) : viewMode === 'MONTHLY_GEN' ? (
          !selectedMonthlySupplier ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
              <p>Select a Supplier to generate their Master Invoice</p>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-gray-700/50 pb-4">
                <h3 className="text-2xl font-bold text-white">Generate Master Invoice</h3>
                <p className="text-yellow-400 font-bold mt-1 text-xl">{selectedMonthlySupplier.supplierName}</p>
                <p className="text-gray-400 text-sm mt-1">Unbilled Monthly Shipments: <span className="font-bold text-white">{selectedMonthlySupplier.shipmentCount}</span></p>
              </div>

              <div className="bg-[#0B0E14] p-5 rounded-xl border border-gray-700 shadow-inner space-y-3">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Estimated Total Base Freight</span>
                  <span className="font-mono text-white font-bold">₹{selectedMonthlySupplier.estimatedSubtotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                </div>
              </div>

              <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/50 flex justify-between items-center">
                <span className="text-sm font-bold text-gray-400 tracking-wider">APPLY TAX</span>
                <select 
                  value={taxPercentage}
                  onChange={e => setTaxPercentage(Number(e.target.value))}
                  className="bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value={18}>18% GST</option>
                  <option value={5}>5% GST (RCM)</option>
                  <option value={0}>0% GST (Exempt)</option>
                </select>
              </div>

              <button 
                onClick={handleGenerateConsolidated}
                disabled={processing}
                className={`w-full py-4 rounded-xl font-bold text-white transition-all duration-300 flex justify-center items-center gap-2 ${
                  processing 
                  ? 'bg-purple-600/50 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-[0_0_20px_rgba(147,51,234,0.4)]'
                }`}
              >
                {processing ? 'Generating...' : `Create Master Invoice for ${selectedMonthlySupplier.supplierName}`}
              </button>
            </div>
          )
        ) : (
          !selectedConsolidated ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
              <p>Select a Master Invoice from the queue</p>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-gray-700/50 pb-4 flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold text-white">Master Invoice</h3>
                  <p className="text-purple-400 font-mono mt-1">{selectedConsolidated.invoiceId}</p>
                  <p className="text-gray-400 text-sm mt-1">Supplier: <span className="font-bold text-white">{selectedConsolidated.supplierName}</span></p>
                  <p className="text-gray-400 text-sm">Total Shipments Included: <span className="font-bold text-white">{selectedConsolidated.shipmentIds.length}</span></p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setPrintMasterInvoice(selectedConsolidated)}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                    Print Summary
                  </button>
                  <button 
                    onClick={handleExportConsolidated}
                    className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition shadow-[0_0_15px_rgba(22,163,74,0.3)]"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path></svg>
                    Export Excel
                  </button>
                </div>
              </div>

              <div className="bg-[#0B0E14] p-5 rounded-xl border border-gray-700 shadow-inner space-y-3">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Subtotal (All Shipments)</span>
                  <span className="font-mono">₹{selectedConsolidated.financials.subtotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Tax Amount</span>
                  <span className="font-mono">+ ₹{selectedConsolidated.financials.taxAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                </div>
                <div className="border-t border-gray-700 pt-3 flex justify-between items-end">
                  <span className="text-lg font-bold text-white">Grand Total</span>
                  <span className="text-3xl font-mono font-bold text-green-400">₹{selectedConsolidated.financials.grandTotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                </div>
              </div>

              {selectedConsolidated.status === 'PENDING' && (
                <>
                  <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/50 flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-400 tracking-wider">PAYMENT METHOD</span>
                    <select 
                      value={paymentMethod}
                      onChange={e => setPaymentMethod(e.target.value)}
                      className="bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                    >
                      <option value="BANK_TRANSFER">Bank Transfer (NEFT/RTGS)</option>
                      <option value="CHEQUE">Cheque</option>
                      <option value="CASH">Cash</option>
                    </select>
                  </div>

                  <button 
                    onClick={handleSettleConsolidated}
                    disabled={processing}
                    className={`w-full py-4 rounded-xl font-bold text-white transition-all duration-300 flex justify-center items-center gap-2 ${
                      processing 
                      ? 'bg-purple-600/50 cursor-not-allowed' 
                      : 'bg-purple-600 hover:bg-purple-500 shadow-[0_0_20px_rgba(147,51,234,0.4)]'
                    }`}
                  >
                    {processing ? 'Processing...' : 'Record Payment & Settle Batch'}
                  </button>
                </>
              )}
            </div>
          )
        )}
      </div>

      {/* Modal for Invoice Print Preview */}
      {printData && (
        <InvoiceModal 
          invoice={printData} 
          orientation="portrait"
          onClose={() => {
            setPrintData(null);
            setSelectedInvoice(null);
          }} 
        />
      )}

      {/* Modal for Master Invoice Print Preview */}
      {printMasterInvoice && (
        <ConsolidatedInvoiceModal 
          invoice={printMasterInvoice} 
          onClose={() => setPrintMasterInvoice(null)} 
        />
      )}
    </div>
  );
};

export default BillingDashboard;
