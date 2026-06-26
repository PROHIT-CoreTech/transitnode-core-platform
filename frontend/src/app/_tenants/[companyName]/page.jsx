'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Configure default base URL if needed (using process.env.NEXT_PUBLIC_API_URL or fallback)
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

/**
 * Dynamic Multi-Tenant Dashboard View.
 * Parses the subdomain slug and skins the layout based on the MongoDB database settings.
 *
 * @param {Object} props
 * @param {Object} props.params - Next.js Route Params
 * @param {string} props.params.companyName - Dynamic path slug parameter representing the tenant
 */
export default function TenantDashboard({ params }) {
  const { companyName } = params;
  const [loading, setLoading] = useState(true);
  const [tenantProfile, setTenantProfile] = useState(null);
  const [error, setError] = useState(null);
  const [dispatches, setDispatches] = useState([]);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    if (!companyName) return;

    const fetchTenantData = async () => {
      try {
        setLoading(true);
        // Fetch workspace configuration details from MongoDB backend API
        const response = await axios.get(`${API_BASE}/api/saas/tenant-profile?subdomain=${companyName}`);
        const profile = response.data;
        setTenantProfile(profile);

        // Apply primary brand colors dynamically to root CSS custom properties
        if (profile.brandingOptions?.dominantHexColor || profile.themeColorHex) {
          const primaryColor = profile.brandingOptions?.dominantHexColor || profile.themeColorHex;
          document.documentElement.style.setProperty('--tenant-primary', primaryColor);
        }

        // Populating dashboard items
        setDispatches([
          { id: 'DSP-001', vehicle: 'MH-12-QW-4521', driver: 'Ramesh Kumar', status: 'In Transit', destination: 'Mumbai' },
          { id: 'DSP-002', vehicle: 'DL-01-AB-9876', driver: 'Amit Sharma', status: 'Loading', destination: 'Delhi' },
          { id: 'DSP-003', vehicle: 'KA-03-XY-1234', driver: 'Srinivas Murthy', status: 'Delivered', destination: 'Bangalore' },
        ]);

        setInvoices([
          { id: 'INV-2026-001', amount: '₹45,000', status: 'Paid', date: '2026-06-25' },
          { id: 'INV-2026-002', amount: '₹1,20,000', status: 'Pending', date: '2026-06-26' },
        ]);

        setError(null);
      } catch (err) {
        console.error('Error loading tenant profile:', err);
        setError(err.response?.data?.error || 'Workspace could not be resolved.');
      } finally {
        setLoading(false);
      }
    };

    fetchTenantData();
  }, [companyName]);

  // Loading UI state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 font-sans">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-slate-800"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-teal-500 animate-spin"></div>
        </div>
        <p className="mt-6 text-sm text-slate-400 font-medium tracking-wide">Resolving workspace config...</p>
      </div>
    );
  }

  // 404 Corporate Fallback Layout if tenant subdomain doesn't exist
  if (error || !tenantProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 font-sans p-6">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-900/10 blur-3xl rounded-full"></div>
          <div className="w-16 h-16 bg-red-950 border border-red-500/30 text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-950/50">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 mb-3">Workspace Not Found</h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            The workspace subdomain <span className="text-red-400 font-semibold">{companyName}</span> does not exist or has expired. Please verify the URL or contact admin.
          </p>
          <a
            href="https://transitnode.prohitcoretech.com"
            className="inline-flex w-full justify-center items-center px-6 py-3 bg-slate-100 text-slate-950 hover:bg-slate-200 font-medium rounded-xl transition-all duration-200 shadow-md shadow-slate-950/20"
          >
            Go to Platform Hub
          </a>
        </div>
      </div>
    );
  }

  const tenantPrimary = tenantProfile.brandingOptions?.dominantHexColor || tenantProfile.themeColorHex || '#0d9488';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-12">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {tenantProfile.brandingOptions?.logoUrl ? (
              <img
                src={tenantProfile.brandingOptions.logoUrl}
                alt={`${tenantProfile.companyName} logo`}
                className="h-9 w-auto object-contain rounded-lg"
              />
            ) : (
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md"
                style={{ backgroundColor: tenantPrimary }}
              >
                {tenantProfile.companyName?.charAt(0).toUpperCase() || 'W'}
              </div>
            )}
            <div>
              <h1 className="font-bold text-lg text-slate-100 leading-none">{tenantProfile.companyName}</h1>
              <span className="text-xs text-slate-400 font-medium tracking-wide">TransitNode Workspace</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="text-xs px-2.5 py-1 font-semibold rounded-full border bg-opacity-10"
              style={{
                borderColor: tenantPrimary,
                color: tenantPrimary,
                backgroundColor: `${tenantPrimary}15`,
              }}
            >
              {tenantProfile.planType} Plan
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-8">
        {/* Welcome Block */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 relative overflow-hidden mb-8 shadow-xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-slate-800/10 blur-3xl rounded-full pointer-events-none"></div>
          <h2 className="text-3xl font-extrabold text-slate-50 tracking-tight mb-2">Welcome Back!</h2>
          <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
            Manage your fleet dashboard, check active dispatches, verify geofence alerts, and review consolidated billing invoices for the <strong className="text-slate-200">{tenantProfile.companyName}</strong> workspace.
          </p>
        </div>

        {/* Dynamic KPI Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider text-slate-400">Active Dispatches</span>
            <div className="text-3xl font-bold mt-2 text-teal-400">3</div>
            <p className="text-xs text-slate-500 mt-2">All fleets are in-route</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider text-slate-400">Outstanding Invoices</span>
            <div className="text-3xl font-bold mt-2 text-amber-400">1</div>
            <p className="text-xs text-slate-500 mt-2">Requires manual reconciliation</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider text-slate-400">License Status</span>
            <div className="text-3xl font-bold mt-2 text-indigo-400">Active</div>
            <p className="text-xs text-slate-500 mt-2">Expires: {new Date(tenantProfile.licenseExpiresAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Operational Views */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Dispatches Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
            <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse"></span>
              Active Fleet Dispatches
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead>
                  <tr className="border-b border-slate-800 text-xs font-semibold uppercase text-slate-400">
                    <th className="pb-3">Trip ID</th>
                    <th className="pb-3">Vehicle</th>
                    <th className="pb-3">Destination</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {dispatches.map((disp) => (
                    <tr key={disp.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 font-medium text-slate-200">{disp.id}</td>
                      <td className="py-3.5">{disp.vehicle}</td>
                      <td className="py-3.5">{disp.destination}</td>
                      <td className="py-3.5">
                        <span
                          className={`text-xs px-2.5 py-0.5 font-semibold rounded-full ${
                            disp.status === 'Delivered'
                              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/30'
                              : disp.status === 'In Transit'
                              ? 'bg-blue-950/80 text-blue-400 border border-blue-800/30'
                              : 'bg-amber-950/80 text-amber-400 border border-amber-800/30'
                          }`}
                        >
                          {disp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Consolidated Invoices Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
            <h3 className="text-lg font-bold text-slate-100 mb-4">Ledger Invoices</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead>
                  <tr className="border-b border-slate-800 text-xs font-semibold uppercase text-slate-400">
                    <th className="pb-3">Invoice Number</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 font-medium text-slate-200">{inv.id}</td>
                      <td className="py-3.5">{inv.date}</td>
                      <td className="py-3.5 font-semibold">{inv.amount}</td>
                      <td className="py-3.5">
                        <span
                          className={`text-xs px-2.5 py-0.5 font-semibold rounded-full ${
                            inv.status === 'Paid'
                              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/30'
                              : 'bg-amber-950/80 text-amber-400 border border-amber-800/30'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
