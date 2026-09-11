import React from 'react';
import brandLogo from '../../assets/brand_logo.png';
import { CheckIcon } from './Icons';

const RegisterModal = ({
  showModal,
  setShowModal,
  selectedPlan,
  currentStep,
  setCurrentStep,
  formData,
  setFormData,
  adminData,
  setAdminData,
  domainSuffix,
  isLocalhost,
  tenantInfo,
  loading,
  result,
  setResult,
  handleCreateWorkspace,
  handlePayment,
  handleAdminSetup
}) => {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl overflow-hidden relative shadow-2xl grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
        
        {/* Left Hero Sidebar */}
        <div className="md:col-span-5 bg-gradient-to-br from-slate-900 via-slate-800 to-[#187baa] p-8 flex flex-col justify-between border-r border-slate-700/60 relative overflow-hidden text-white">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent pointer-events-none"></div>
          
          <div>
            <div className="flex items-center space-x-3 mb-8">
              <img src={brandLogo} alt="Logo" className="h-6 w-auto brightness-0 invert opacity-90" />
              <span className="font-bold tracking-tight uppercase text-white text-xs">TransitNode</span>
            </div>
            
            <div className="inline-block bg-blue-950/80 border border-blue-400/50 text-blue-200 text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider mb-4">
              {selectedPlan} Plan Workspace Setup
            </div>

            <h3 className="text-2xl font-bold text-white mb-3">Enterprise Logistics Core</h3>
            <p className="text-slate-300 text-xs leading-relaxed mb-6 font-light">
              Get full control tower access, live fleet telemetry, automated Tally ERP syncing, and compliance vaults.
            </p>

            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-center"><CheckIcon className="w-4 h-4 text-blue-400 mr-2" /> Dedicated Subdomain Provisioning</li>
              <li className="flex items-center"><CheckIcon className="w-4 h-4 text-blue-400 mr-2" /> Multi-Tenant Role Isolation</li>
              <li className="flex items-center"><CheckIcon className="w-4 h-4 text-blue-400 mr-2" /> Cashfree Gateway Integration</li>
              <li className="flex items-center"><CheckIcon className="w-4 h-4 text-blue-400 mr-2" /> Single Sign-On (SSO) Magic Link</li>
            </ul>
          </div>

          <div className="pt-6 border-t border-slate-700/60 text-[11px] text-slate-300 flex items-center justify-between">
            <span>🔒 256-Bit Encrypted Portal</span>
            <span className="font-mono text-blue-300 font-semibold">{isLocalhost ? 'Localhost Dev' : 'Production'}</span>
          </div>
        </div>

        {/* Right Interactive Form Area */}
        <div className="md:col-span-7 p-8 md:p-10 flex flex-col justify-between relative bg-white">
          <button 
            onClick={() => {
              setShowModal(false);
              setCurrentStep('WORKSPACE');
              setResult(null);
            }} 
            className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>

          <div>
            {/* Step Progress Header */}
            <div className="mb-8 pr-8">
              <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider mb-2 text-slate-400">
                <span className={currentStep === 'WORKSPACE' ? 'text-[#187baa] font-bold' : ''}>1. Workspace</span>
                <span className={currentStep === 'PAYMENT' ? 'text-[#187baa] font-bold' : ''}>2. Payment</span>
                <span className={currentStep === 'ADMIN_SETUP' ? 'text-[#187baa] font-bold' : ''}>3. Admin Setup</span>
                <span className={currentStep === 'COMPLETE' ? 'text-[#187baa] font-bold' : ''}>4. Launch</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-[#187baa] h-full transition-all duration-500"
                  style={{
                    width: currentStep === 'WORKSPACE' ? '25%' : currentStep === 'PAYMENT' ? '50%' : currentStep === 'ADMIN_SETUP' ? '75%' : '100%'
                  }}
                ></div>
              </div>
            </div>

            {/* STEP 1: CREATE WORKSPACE */}
            {currentStep === 'WORKSPACE' && (
              <>
                <h3 className="text-2xl font-bold text-slate-900 mb-1">Create Workspace</h3>
                <p className="text-slate-500 text-xs mb-6">Enter your organization details to reserve your dedicated logistics subdomain.</p>
                
                <form onSubmit={handleCreateWorkspace} className="space-y-5">
                  <div>
                    <label className="block text-slate-700 text-xs font-medium mb-1.5">Company Name</label>
                    <input required type="text" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm" placeholder="e.g. Koyala Logistics Inc" />
                  </div>
                  <div>
                    <label className="block text-slate-700 text-xs font-medium mb-1.5">Registered Mobile Number</label>
                    <input required type="tel" value={formData.registeredMobile} onChange={e => setFormData({...formData, registeredMobile: e.target.value})} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm" placeholder="+91 9876543210" />
                  </div>
                  <div>
                    <label className="block text-slate-700 text-xs font-medium mb-1.5">Custom Workspace Domain</label>
                    <div className="flex">
                      <input required type="text" value={formData.customSubdomain} onChange={e => setFormData({...formData, customSubdomain: e.target.value})} className="w-full bg-slate-50 border border-slate-300 rounded-l-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm font-mono" placeholder="acme" />
                      <span className="bg-slate-100 border border-slate-300 border-l-0 rounded-r-xl px-4 py-3 text-slate-600 text-xs flex items-center font-mono">{domainSuffix}</span>
                    </div>
                  </div>
                  
                  <button disabled={loading} type="submit" className="w-full bg-[#187baa] hover:bg-[#14668f] text-white font-bold py-3.5 px-4 rounded-xl mt-6 transition-all disabled:opacity-50 text-sm shadow-md">
                    {loading ? 'Reserving Subdomain...' : 'Create Workspace & Proceed to Payment →'}
                  </button>
                </form>
              </>
            )}

            {/* STEP 2: PAYMENT INTEGRATION */}
            {currentStep === 'PAYMENT' && (
              <>
                <h3 className="text-2xl font-bold text-slate-900 mb-1">Payment Integration</h3>
                <p className="text-slate-500 text-xs mb-6">Complete subscription checkout for <span className="text-blue-600 font-bold uppercase">{selectedPlan}</span> plan.</p>
                
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-6 text-xs space-y-3">
                  <div className="flex justify-between text-slate-600">
                    <span>Company:</span>
                    <span className="font-bold text-slate-900 text-sm">{formData.companyName}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Workspace URL:</span>
                    <span className="font-mono text-[#187baa] text-sm">{formData.customSubdomain}{domainSuffix}</span>
                  </div>
                  <div className="flex justify-between text-slate-700 border-t border-slate-200 pt-3 font-bold text-base">
                    <span>Total Payable:</span>
                    <span className="text-[#187baa]">
                      {selectedPlan === 'silver' ? '₹50,000' : selectedPlan === 'platinum' ? '₹1,00,000' : '₹5,00,000'}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {tenantInfo?.orderSessionId && (
                    <button 
                      onClick={handlePayment} 
                      className="w-full bg-[#187baa] hover:bg-[#14668f] text-white font-bold py-3.5 px-4 rounded-xl transition-colors text-sm flex items-center justify-center space-x-2 shadow-md"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                      <span>Pay via Cashfree Gateway</span>
                    </button>
                  )}

                  <button 
                    onClick={() => setCurrentStep('ADMIN_SETUP')} 
                    className="w-full bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-medium py-3 px-4 rounded-xl transition-colors text-xs"
                  >
                    Complete Payment & Proceed to First User Setup →
                  </button>
                </div>
              </>
            )}

            {/* STEP 3: FIRST USER CREATE */}
            {currentStep === 'ADMIN_SETUP' && (
              <>
                <h3 className="text-2xl font-bold text-slate-900 mb-1">Create Admin Account</h3>
                <p className="text-slate-500 text-xs mb-6">Set up master admin login credentials for <span className="text-[#187baa] font-bold">{formData.companyName}</span>.</p>
                
                <form onSubmit={handleAdminSetup} className="space-y-4">
                  <div>
                    <label className="block text-slate-700 text-xs font-medium mb-1.5">Admin Username / Email</label>
                    <input 
                      required 
                      type="text" 
                      value={adminData.username} 
                      onChange={e => setAdminData({...adminData, username: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm" 
                      placeholder="admin@domain.com or 9876543210" 
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 text-xs font-medium mb-1.5">New Password</label>
                    <input 
                      required 
                      type="password" 
                      value={adminData.password} 
                      onChange={e => setAdminData({...adminData, password: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm" 
                      placeholder="••••••••" 
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 text-xs font-medium mb-1.5">Confirm Password</label>
                    <input 
                      required 
                      type="password" 
                      value={adminData.confirmPassword} 
                      onChange={e => setAdminData({...adminData, confirmPassword: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm" 
                      placeholder="••••••••" 
                    />
                  </div>
                  
                  <button disabled={loading} type="submit" className="w-full bg-[#187baa] hover:bg-[#14668f] text-white font-bold py-3.5 px-4 rounded-xl mt-6 transition-all disabled:opacity-50 text-sm shadow-md">
                    {loading ? 'Securing Credentials...' : 'Create Admin Account & Secure Workspace →'}
                  </button>
                </form>
              </>
            )}

            {/* STEP 4: MAGIC LINK & LAUNCH */}
            {currentStep === 'COMPLETE' && (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-blue-100 text-[#187baa] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
                  <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Workspace Ready!</h3>
                <p className="text-slate-600 text-xs mb-8 max-w-sm mx-auto">Your dedicated workspace and admin credentials have been configured successfully.</p>
                
                <a 
                  href={result?.fullLoginUrl || tenantInfo?.fullLoginUrl || `http://${formData.customSubdomain}${domainSuffix}/login`}
                  className="w-full bg-[#187baa] hover:bg-[#14668f] text-white font-bold py-4 px-6 rounded-xl transition-colors text-sm flex items-center justify-center space-x-2 shadow-lg"
                >
                  <span>Login via Magic Link</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </a>
              </div>
            )}
          </div>
          
          {/* Error / Result message */}
          {result && (
            <div className={`mt-6 p-3.5 rounded-xl text-xs ${result.success ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
              {result.message}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default RegisterModal;
