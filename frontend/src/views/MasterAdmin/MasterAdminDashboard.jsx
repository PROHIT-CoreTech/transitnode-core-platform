import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';

const MasterAdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  const [manualForm, setManualForm] = useState({
    companyName: '',
    registeredMobile: '',
    planType: 'TRIAL',
    licenseDurationDays: '14',
    customMaxCompanies: '',
    amountPaid: '',
    address: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tenant Details Modal State
  const [selectedTenantId, setSelectedTenantId] = useState(null);
  const [tenantDetails, setTenantDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Success Modal State
  const [onboardSuccess, setOnboardSuccess] = useState(null);

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      Authorization: `Bearer ${token}`,
      'x-master-admin-key': process.env.REACT_APP_MASTER_KEY || 'transitnode-master-key'
    };
  };

  const fetchDashboardSummary = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.REACT_APP_API_URL || process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/master-admin/dashboard-summary`, {
        headers: getHeaders()
      });
      setSummary(res.data);
    } catch (error) {
      console.error('Failed to fetch master dashboard summary', error);
      if (error.response && error.response.status === 401) {
        alert('Unauthorized. Master Key is missing or invalid.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardSummary();
  }, []);

  const fetchTenantDetails = async (tenantId) => {
    try {
      setSelectedTenantId(tenantId);
      setLoadingDetails(true);
      const res = await axios.get(`${process.env.REACT_APP_API_URL || process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/master-admin/tenant/${tenantId}`, {
        headers: getHeaders()
      });
      setTenantDetails(res.data);
    } catch (error) {
      console.error('Failed to fetch tenant details:', error);
      alert('Failed to load tenant details.');
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeTenantDetails = () => {
    setSelectedTenantId(null);
    setTenantDetails(null);
  };

  const handleManualOnboard = async (e) => {
    e.preventDefault();
    if (!manualForm.companyName || !manualForm.registeredMobile || !manualForm.licenseDurationDays) {
      alert("Please fill in all required fields.");
      return;
    }
    
    try {
      setIsSubmitting(true);
      const res = await axios.post(`${process.env.REACT_APP_API_URL || process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/master-admin/onboard-manual`, manualForm, {
        headers: getHeaders()
      });
      setOnboardSuccess(res.data);
      setManualForm({
        companyName: '',
        registeredMobile: '',
        planType: 'TRIAL',
        licenseDurationDays: '14',
        customMaxCompanies: '',
        amountPaid: '',
        address: ''
      });
      fetchDashboardSummary(); // refresh stats
    } catch (error) {
      console.error('Manual onboard failed:', error);
      alert(error.response?.data?.error || 'Failed to manually onboard tenant.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && !summary) {
    return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div></div>;
  }

  // Formatting chart data
  const chartData = summary?.tenantsByTier?.map(t => ({
    name: t._id || 'UNKNOWN',
    Tenants: t.count
  })) || [];

  // 1. Payment Method Breakdown (for Pie/Donut Chart)
  const methodMap = {};
  summary?.recentTransactions?.forEach(tx => {
    const method = tx.paymentMethod === 'STRIPE' ? 'Stripe' :
                   tx.paymentMethod === 'OFFLINE_MANUAL' ? 'Offline Manual' :
                   tx.paymentMethod === 'backfill' ? 'System Backfill' :
                   tx.paymentMethod?.replace(/_/g, ' ').toUpperCase() || 'UNKNOWN';
    methodMap[method] = (methodMap[method] || 0) + tx.amount;
  });
  const paymentMethodData = Object.keys(methodMap).map(name => ({
    name,
    value: methodMap[name]
  }));

  // Colors for Donut Chart cells
  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#3b82f6', '#ec4899'];

  // 2. Cumulative Revenue Trend over Time (Area Chart)
  const sortedTx = [...(summary?.recentTransactions || [])].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  let runningTotal = 0;
  const revenueTrendData = sortedTx.map(tx => {
    runningTotal += tx.amount;
    return {
      date: new Date(tx.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: '2-digit' }),
      'Cumulative Revenue': runningTotal,
      'Amount': tx.amount,
      company: tx.tenantId?.companyName || 'Unknown Tenant'
    };
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 p-8">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8 bg-slate-900 text-white p-6 rounded-xl shadow-lg">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Global Command Center</h1>
          <p className="text-slate-400 mt-1">Master User Interface</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <p className="font-semibold text-sm">{user?.name}</p>
            <p className="text-xs text-indigo-400">Owner</p>
          </div>
          <button onClick={logout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Logout
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4 mb-8">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'overview'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 shadow-sm'
          }`}
        >
          <span>📊 Overview</span>
        </button>
        <button
          onClick={() => setActiveTab('tenants')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'tenants'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 shadow-sm'
          }`}
        >
          <span>🏢 Tenants Directory</span>
          <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${activeTab === 'tenants' ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-100 text-slate-600'}`}>
            {summary?.allTenants?.length || 0}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('onboard')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'onboard'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 shadow-sm'
          }`}
        >
          <span>➕ Provision Tenant</span>
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'transactions'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 shadow-sm'
          }`}
        >
          <span>💸 Transactions History</span>
          <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${activeTab === 'transactions' ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-100 text-slate-600'}`}>
            {summary?.recentTransactions?.length || 0}
          </span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="mt-4">
        {/* 1. Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-center items-center text-center hover:shadow-md transition-shadow">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide">Total SaaS Revenue</h3>
                <p className="text-5xl font-black text-amber-500 mt-4">₹{(summary?.totalRevenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-center items-center text-center hover:shadow-md transition-shadow">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide">Global Active Vehicles</h3>
                <p className="text-5xl font-black text-indigo-600 mt-4">{summary?.activeVehiclesCount || 0}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-center items-center text-center hover:shadow-md transition-shadow">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide">Daily Telemetry Volume</h3>
                <p className="text-5xl font-black text-emerald-600 mt-4">{summary?.dailyTrackingVolume || 0}</p>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Bar Chart: Tenants by Tier */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-bold text-slate-800 mb-6 border-b pb-2">Tenants by Subscription Tier</h2>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                      <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                      <Bar dataKey="Tenants" fill="#4f46e5" radius={[6, 6, 0, 0]}>
                        {chartData.map((entry, index) => {
                          const colorsMap = {
                            LIFETIME: '#8b5cf6', // purple-500
                            PLATINUM: '#1e293b', // slate-800
                            SILVER: '#64748b',   // slate-500
                            TRIAL: '#3b82f6'      // blue-500
                          };
                          return <Cell key={`cell-${index}`} fill={colorsMap[entry.name] || '#4f46e5'} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pie/Donut Chart: Revenue by Payment Method */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-bold text-slate-800 mb-6 border-b pb-2">Revenue by Payment Method</h2>
                <div className="h-80 w-full flex flex-col sm:flex-row justify-center items-center">
                  {paymentMethodData.length > 0 ? (
                    <>
                      <div className="h-60 w-60 flex-shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                            <Pie
                              data={paymentMethodData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={4}
                              dataKey="value"
                            >
                              {paymentMethodData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="sm:ml-6 mt-4 sm:mt-0 flex flex-col space-y-2">
                        {paymentMethodData.map((entry, index) => (
                          <div key={entry.name} className="flex items-center space-x-2">
                            <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                            <span className="text-xs font-semibold text-slate-600">{entry.name}:</span>
                            <span className="text-xs font-bold text-slate-800">₹{entry.value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-slate-500 text-sm">No transaction records to plot.</div>
                  )}
                </div>
              </div>
            </div>

            {/* Area Chart: Revenue growth trend */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-6 border-b pb-2">SaaS Revenue Growth Trend (Cumulative)</h2>
              <div className="h-80 w-full">
                {revenueTrendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueTrendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(v) => `₹${v / 1000}k`} />
                      <Tooltip
                        formatter={(value, name, props) => {
                          if (name === 'Cumulative Revenue') return [`₹${value.toLocaleString('en-IN')}`, 'Total SaaS Revenue'];
                          if (name === 'Amount') return [`₹${value.toLocaleString('en-IN')}`, `Payment from ${props.payload.company}`];
                          return [value, name];
                        }}
                        contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                      />
                      <Area type="monotone" dataKey="Cumulative Revenue" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                      <Area type="monotone" dataKey="Amount" stroke="#10b981" strokeWidth={1} fillOpacity={0.1} fill="#10b981" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex justify-center items-center h-full text-slate-500">No transaction data available.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. Tenants Directory Tab */}
        {activeTab === 'tenants' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-200">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-800">All Registered Tenants</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-600 uppercase tracking-wider">
                    <th className="p-4">Company Name</th>
                    <th className="p-4">Subdomain</th>
                    <th className="p-4">Plan Tier</th>
                    <th className="p-4">Mobile</th>
                    <th className="p-4">License Expiry</th>
                    <th className="p-4">Registered On</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-100">
                  {summary?.allTenants?.length > 0 ? (
                    summary.allTenants.map((tenant) => (
                      <tr key={tenant._id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-medium text-slate-900">{tenant.companyName}</td>
                        <td className="p-4 text-indigo-600">{tenant.customSubdomain}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            tenant.planType === 'LIFETIME' ? 'bg-purple-100 text-purple-800' :
                            tenant.planType === 'PLATINUM' ? 'bg-slate-800 text-slate-200' :
                            tenant.planType === 'SILVER' ? 'bg-slate-200 text-slate-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {tenant.planType}
                          </span>
                        </td>
                        <td className="p-4 text-slate-600">{tenant.registeredMobile}</td>
                        <td className="p-4 text-slate-600">
                          {tenant.planType === 'LIFETIME' ? (
                            <span className="font-semibold text-purple-700">Lifetime</span>
                          ) : (
                            new Date(tenant.licenseExpiresAt).toLocaleDateString()
                          )}
                        </td>
                        <td className="p-4 text-slate-500">{new Date(tenant.createdAt).toLocaleDateString()}</td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => fetchTenantDetails(tenant._id)}
                            className="text-indigo-600 hover:text-indigo-800 font-medium text-sm transition-colors"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-slate-500">No tenants found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. Onboard Tenant Tab */}
        {activeTab === 'onboard' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-4xl mx-auto animate-in fade-in duration-200">
            <h2 className="text-xl font-bold text-slate-800 mb-6 border-b pb-2">Manual Tenant Onboarding (Offline Payments)</h2>
            <form onSubmit={handleManualOnboard} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                <input type="text" required value={manualForm.companyName} onChange={e => setManualForm({...manualForm, companyName: e.target.value})} className="w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border bg-white" placeholder="e.g. Acme Transport" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Postal Address</label>
                <textarea value={manualForm.address} onChange={e => setManualForm({...manualForm, address: e.target.value})} className="w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border bg-white" placeholder="e.g. 123 Logistics Park, Mumbai, Maharashtra" rows="2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Registered Mobile Number</label>
                <input type="text" required value={manualForm.registeredMobile} onChange={e => setManualForm({...manualForm, registeredMobile: e.target.value})} className="w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border bg-white" placeholder="10-digit number" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Plan Type</label>
                  <select value={manualForm.planType} onChange={e => setManualForm({...manualForm, planType: e.target.value})} className="w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border bg-white">
                    <option value="TRIAL">Trial</option>
                    <option value="SILVER">Silver</option>
                    <option value="PLATINUM">Platinum</option>
                    <option value="LIFETIME">Lifetime</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">License Duration (Days)</label>
                  <input type="number" required value={manualForm.licenseDurationDays} onChange={e => setManualForm({...manualForm, licenseDurationDays: e.target.value})} className="w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border bg-white" placeholder="e.g. 365" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Custom Max Companies Allowed (Optional)</label>
                  <input type="number" value={manualForm.customMaxCompanies} onChange={e => setManualForm({...manualForm, customMaxCompanies: e.target.value})} className="w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border bg-white" placeholder="Defaults to 1 or 3 based on plan" />
                  <p className="text-xs text-slate-500 mt-1">Leave blank to use default plan limits.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Amount Paid (₹) (Optional)</label>
                  <input type="number" value={manualForm.amountPaid} onChange={e => setManualForm({...manualForm, amountPaid: e.target.value})} className="w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border bg-white" placeholder="e.g. 500000" />
                  <p className="text-xs text-slate-500 mt-1">Leave blank for trials or zero-revenue.</p>
                </div>
              </div>

              <div className="pt-4">
                <button disabled={isSubmitting} type="submit" className={`w-full text-white py-3 px-4 rounded-lg font-bold transition-colors ${isSubmitting ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                  {isSubmitting ? 'Provisioning...' : 'Provision New Tenant'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 4. Transactions History Tab */}
        {activeTab === 'transactions' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-200">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">Subscription Transactions History</h2>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                {summary?.recentTransactions?.length || 0} Transactions
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-600 uppercase tracking-wider">
                    <th className="p-4">Company Name</th>
                    <th className="p-4">Plan Tier</th>
                    <th className="p-4">Amount Paid</th>
                    <th className="p-4">Payment Type</th>
                    <th className="p-4">Transaction Date</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-100">
                  {summary?.recentTransactions?.length > 0 ? (
                    summary.recentTransactions.map((tx) => (
                      <tr key={tx._id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-medium text-slate-900">
                          {tx.tenantId?.companyName || (
                            <span className="text-slate-400 italic">Unknown / Deleted Tenant</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            tx.planType === 'LIFETIME' ? 'bg-purple-100 text-purple-800' :
                            tx.planType === 'PLATINUM' ? 'bg-slate-800 text-slate-200' :
                            tx.planType === 'SILVER' ? 'bg-slate-200 text-slate-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {tx.planType}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-slate-700">
                          ₹{(tx.amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            tx.paymentMethod === 'STRIPE' ? 'bg-indigo-100 text-indigo-800' :
                            tx.paymentMethod === 'OFFLINE_MANUAL' ? 'bg-emerald-100 text-emerald-800' :
                            tx.paymentMethod === 'backfill' ? 'bg-amber-100 text-amber-800' :
                            'bg-slate-100 text-slate-800'
                          }`}>
                            {tx.paymentMethod === 'STRIPE' ? 'Stripe (Card)' :
                             tx.paymentMethod === 'OFFLINE_MANUAL' ? 'Offline (Manual)' :
                             tx.paymentMethod === 'backfill' ? 'System Backfill' :
                             tx.paymentMethod?.replace(/_/g, ' ').toUpperCase() || 'UNKNOWN'}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500">
                          {new Date(tx.createdAt).toLocaleString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-slate-500">No transactions recorded.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      
      {/* Tenant Details Modal */}
      {selectedTenantId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex justify-between items-center bg-slate-900 text-white p-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Tenant Details</h2>
                {tenantDetails && (
                  <>
                    <p className="text-slate-400 text-sm mt-1">
                      {tenantDetails.tenant.companyName} ({tenantDetails.tenant.customSubdomain})
                    </p>
                    {tenantDetails.tenant.address && (
                      <p className="text-slate-300 text-sm mt-1 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.242-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        {tenantDetails.tenant.address}
                      </p>
                    )}
                  </>
                )}
              </div>
              <button onClick={closeTenantDetails} className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
              {loadingDetails || !tenantDetails ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm">
                      <p className="text-xs font-bold text-slate-500 uppercase">Plan</p>
                      <p className="text-lg font-black text-indigo-600 mt-1">{tenantDetails.tenant.planType}</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm">
                      <p className="text-xs font-bold text-slate-500 uppercase">Payment Status</p>
                      <p className={`text-lg font-black mt-1 ${tenantDetails.tenant.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-500'}`}>{tenantDetails.tenant.paymentStatus}</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm">
                      <p className="text-xs font-bold text-slate-500 uppercase">Total Users</p>
                      <p className="text-lg font-black text-slate-800 mt-1">{tenantDetails.metrics.totalUsers}</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm">
                      <p className="text-xs font-bold text-slate-500 uppercase">Active Vehicles</p>
                      <p className="text-lg font-black text-slate-800 mt-1">{tenantDetails.metrics.activeVehicles}</p>
                    </div>
                  </div>

                  {/* Registered Workspaces/Companies */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">Registered Workspaces ({tenantDetails.companies.length} / {tenantDetails.tenant.maxCompaniesAllowed})</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {tenantDetails.companies.map((company, idx) => (
                        <div key={company._id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm relative overflow-hidden">
                          {idx === 0 && <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>}
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-slate-900">{company.companyName}</h4>
                            {idx === 0 && <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Primary</span>}
                          </div>
                          <p className="text-sm text-slate-600 mb-1"><span className="font-medium text-slate-500">Contact:</span> {company.contactNumber}</p>
                          {company.gstin && <p className="text-sm text-slate-600 mb-1"><span className="font-medium text-slate-500">GSTIN:</span> {company.gstin}</p>}
                          {company.pan && <p className="text-sm text-slate-600 mb-1"><span className="font-medium text-slate-500">PAN:</span> {company.pan}</p>}
                          <p className="text-sm text-slate-600 mt-3 pt-3 border-t border-slate-100">{company.address}, {company.state}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Danger Zone (Future use) */}
                  <div className="mt-8 pt-6 border-t border-red-100">
                    <h3 className="text-sm font-bold text-red-500 uppercase tracking-wide mb-4">Danger Zone</h3>
                    <button className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold py-2 px-4 rounded-lg text-sm transition-colors opacity-50 cursor-not-allowed" disabled>
                      Suspend Tenant Account
                    </button>
                    <p className="text-xs text-slate-500 mt-2">Suspension features are currently disabled.</p>
                  </div>

                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="bg-white border-t border-slate-200 p-4 text-right">
              <button onClick={closeTenantDetails} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-6 rounded-lg transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Onboard Success Modal */}
      {onboardSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="bg-emerald-500 p-6 flex flex-col items-center justify-center text-white">
              <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <h2 className="text-2xl font-bold">Successfully Onboarded!</h2>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-slate-600 text-center">Tenant has been provisioned. Please send the setup link below to the client.</p>
              
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Subdomain</p>
                <p className="font-medium text-slate-800">{onboardSuccess.subdomain}</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Admin Setup Link</p>
                <div className="flex items-center gap-2">
                  <a href={onboardSuccess.setupLink} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 font-medium underline break-all">
                    {onboardSuccess.setupLink}
                  </a>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 border-t border-slate-200 p-4 flex justify-end">
              <button onClick={() => setOnboardSuccess(null)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MasterAdminDashboard;
