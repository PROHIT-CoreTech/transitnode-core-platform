import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const MasterAdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  
  const [manualForm, setManualForm] = useState({
    companyName: '',
    registeredMobile: '',
    planType: 'TRIAL',
    licenseDurationDays: '14',
    customMaxCompanies: '',
    amountPaid: ''
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
      const res = await axios.get('http://localhost:3000/api/master-admin/dashboard-summary', {
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
      const res = await axios.get(`http://localhost:3000/api/master-admin/tenant/${tenantId}`, {
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
      const res = await axios.post('http://localhost:3000/api/master-admin/onboard-manual', manualForm, {
        headers: getHeaders()
      });
      setOnboardSuccess(res.data);
      setManualForm({
        companyName: '',
        registeredMobile: '',
        planType: 'TRIAL',
        licenseDurationDays: '14',
        customMaxCompanies: '',
        amountPaid: ''
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

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-center items-center text-center">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide">Total SaaS Revenue</h3>
          <p className="text-5xl font-black text-amber-500 mt-4">₹{(summary?.totalRevenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-center items-center text-center">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide">Global Active Vehicles</h3>
          <p className="text-5xl font-black text-indigo-600 mt-4">{summary?.activeVehiclesCount || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-center items-center text-center">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide">Daily Telemetry Tracking Volume</h3>
          <p className="text-5xl font-black text-emerald-600 mt-4">{summary?.dailyTrackingVolume || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Analytics Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-6 border-b pb-2">Tenants by Subscription Tier</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="Tenants" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Manual Onboarding Form */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-6 border-b pb-2">Manual Tenant Onboarding (Offline Payments)</h2>
          <form onSubmit={handleManualOnboard} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
              <input type="text" required value={manualForm.companyName} onChange={e => setManualForm({...manualForm, companyName: e.target.value})} className="w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border bg-white" placeholder="e.g. Acme Transport" />
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
      </div>

      {/* Tenants List Table */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
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
                  <td colSpan="6" className="p-8 text-center text-slate-500">No tenants found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Tenant Details Modal */}
      {selectedTenantId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex justify-between items-center bg-slate-900 text-white p-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Tenant Details</h2>
                {tenantDetails && <p className="text-slate-400 text-sm mt-1">{tenantDetails.tenant.companyName} ({tenantDetails.tenant.customSubdomain})</p>}
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
