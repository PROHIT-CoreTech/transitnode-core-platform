import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FinancialLedger = () => {
  const [trialBalance, setTrialBalance] = useState([]);
  const [pnl, setPnl] = useState(null);
  const [payrollData, setPayrollData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('LEDGER'); // LEDGER or PAYROLL

  const fetchFinanceData = async () => {
    try {
      const [tbRes, pnlRes] = await Promise.all([
        axios.get('http://localhost:3000/api/finance/ledger'),
        axios.get('http://localhost:3000/api/finance/pnl')
      ]);
      setTrialBalance(tbRes.data.data || []);
      setPnl(pnlRes.data.data || null);
    } catch (err) {
      console.error('Failed to fetch finance data', err);
    }
  };

  const fetchPayroll = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/payroll');
      setPayrollData(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch payroll', err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchFinanceData();
      await fetchPayroll();
      setLoading(false);
    };
    loadData();
  }, []);

  const handleExportTally = () => {
    window.location.href = 'http://localhost:3000/api/finance/export/tally';
  };

  const handleCalculatePayroll = async () => {
    try {
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      await axios.post(`http://localhost:3000/api/payroll/calculate?month=${currentMonth}`);
      await fetchPayroll();
      alert('Payroll calculated successfully!');
    } catch (err) {
      alert('Failed to calculate payroll');
    }
  };

  const handleDisbursePayroll = async (ids) => {
    try {
      await axios.post('http://localhost:3000/api/payroll/disburse', { ids });
      await fetchPayroll();
      alert('Payroll disbursed!');
    } catch (err) {
      alert('Failed to disburse payroll');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0d1117] text-white">
        <div className="text-xl font-semibold animate-pulse">Loading Financial Engine...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] p-8 text-white font-sans selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gray-900/50 p-8 rounded-3xl border border-white/5 shadow-2xl backdrop-blur-xl">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Financial Engine
            </h1>
            <p className="text-gray-400 mt-2 text-lg">Real-time ledger, P&L, and Tally ERP sync</p>
          </div>
          <button 
            onClick={handleExportTally}
            className="group flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transform hover:-translate-y-1"
          >
            <svg className="w-5 h-5 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            Export Data to Tally ERP
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 border-b border-white/10 pb-4">
          <button 
            onClick={() => setActiveTab('LEDGER')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${activeTab === 'LEDGER' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            Ledger & P&L
          </button>
          <button 
            onClick={() => setActiveTab('PAYROLL')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${activeTab === 'PAYROLL' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            Payroll Processing
          </button>
        </div>

        {/* Ledger View */}
        {activeTab === 'LEDGER' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Trial Balance Table */}
            <div className="bg-gray-900/40 border border-white/5 rounded-2xl p-6 backdrop-blur-md">
              <h2 className="text-2xl font-bold mb-6 text-indigo-400 flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                Live Trial Balance
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400">
                      <th className="py-3 px-4 font-medium">Account</th>
                      <th className="py-3 px-4 font-medium text-right">Debit (₹)</th>
                      <th className="py-3 px-4 font-medium text-right">Credit (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trialBalance.map((item, idx) => (
                      <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 text-gray-200">{item.account}</td>
                        <td className="py-3 px-4 text-right text-emerald-400">{item.debit > 0 ? item.debit.toLocaleString() : '-'}</td>
                        <td className="py-3 px-4 text-right text-rose-400">{item.credit > 0 ? item.credit.toLocaleString() : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* P&L Snapshot */}
            <div className="bg-gray-900/40 border border-white/5 rounded-2xl p-6 backdrop-blur-md">
              <h2 className="text-2xl font-bold mb-6 text-rose-400 flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                Profit & Loss Snapshot
              </h2>
              {pnl ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                    <span className="text-gray-400">Gross Revenue</span>
                    <span className="text-xl font-bold text-emerald-400">₹{pnl.revenue.toLocaleString()}</span>
                  </div>
                  
                  <div className="space-y-3 px-4">
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>- Fuel Expenses</span>
                      <span>₹{pnl.expenses.fuel.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>- Toll Expenses</span>
                      <span>₹{pnl.expenses.toll.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>- Driver Advances (Cost)</span>
                      <span>₹{pnl.expenses.driverAdvances.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-gradient-to-r from-emerald-900/40 to-transparent p-4 rounded-xl border-l-4 border-emerald-500">
                    <span className="font-semibold text-gray-300">Net Profit</span>
                    <span className="text-3xl font-black text-emerald-500">₹{pnl.netProfit.toLocaleString()}</span>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 italic">No data available.</div>
              )}
            </div>
          </div>
        )}

        {/* Payroll View */}
        {activeTab === 'PAYROLL' && (
          <div className="bg-gray-900/40 border border-white/5 rounded-2xl p-6 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                Payroll Processing
              </h2>
              <button 
                onClick={handleCalculatePayroll}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-indigo-500/20"
              >
                Run Monthly Calculation
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400">
                    <th className="py-3 px-4 font-medium">Employee</th>
                    <th className="py-3 px-4 font-medium">Role</th>
                    <th className="py-3 px-4 font-medium">Month</th>
                    <th className="py-3 px-4 font-medium text-right">Base Salary</th>
                    <th className="py-3 px-4 font-medium text-right text-rose-400">- Advances</th>
                    <th className="py-3 px-4 font-medium text-right text-emerald-400">Net Pay</th>
                    <th className="py-3 px-4 font-medium text-center">Status</th>
                    <th className="py-3 px-4 font-medium text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {payrollData.length > 0 ? (
                    payrollData.map((record) => (
                      <tr key={record._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 font-medium">{record.employeeName || record.employeeId}</td>
                        <td className="py-3 px-4 text-sm text-gray-400">{record.role}</td>
                        <td className="py-3 px-4 text-sm">{record.paymentMonth}</td>
                        <td className="py-3 px-4 text-right">₹{record.baseSalary.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right text-rose-400 font-medium">₹{record.totalAdvances.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right text-emerald-400 font-bold">₹{record.netPay.toLocaleString()}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${record.status === 'PAID' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {record.status === 'PENDING' && (
                            <button 
                              onClick={() => handleDisbursePayroll([record._id])}
                              className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded transition-colors"
                            >
                              Disburse
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="py-8 text-center text-gray-500">
                        No payroll records found. Run the calculation engine to generate data.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialLedger;
