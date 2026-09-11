import React, { useState } from 'react';
import axios from 'axios';
import brandLogo from '../../assets/brand_logo.png';

const CheckIcon = ({ className = "w-4 h-4 text-blue-600 mr-2 flex-shrink-0" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
  </svg>
);

const SolidCheckIcon = ({ className = "w-4 h-4 text-white" }) => (
  <div className="w-5 h-5 rounded-full bg-[#187baa] flex items-center justify-center flex-shrink-0 mr-3">
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
    </svg>
  </div>
);

const StarIcon = ({ className = "w-4 h-4 text-amber-400 fill-current" }) => (
  <svg className={className} viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const HalfStarIcon = ({ className = "w-4 h-4 text-amber-400 fill-current" }) => (
  <div className="relative w-4 h-4">
    <svg className="w-4 h-4 text-slate-300 fill-current" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
    <div className="absolute inset-0 overflow-hidden w-1/2">
      <svg className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    </div>
  </div>
);

const PricingPortal = () => {
  const hostname = window.location.hostname;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  const domainSuffix = isLocalhost ? '.localhost:3001' : '.transitnode.prohitcoretech.com';

  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('free');
  const [useSvg, setUseSvg] = useState(true);
  const [formData, setFormData] = useState({
    companyName: '',
    registeredMobile: '',
    customSubdomain: ''
  });
  const [currentStep, setCurrentStep] = useState('WORKSPACE');
  const [tenantInfo, setTenantInfo] = useState(null);
  const [adminData, setAdminData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const testimonials = [
    {
      name: "Anis S.",
      role: "Head of Operations, Indigo",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip"
    },
    {
      name: "Anis S.",
      role: "Head of Operations, Indigo",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
      quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip"
    },
    {
      name: "Anis S.",
      role: "Head of Operations, Indigo",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
      quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip"
    }
  ];

  // Step 1: Create Workspace
  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      const response = await axios.post(`${apiUrl}/api/saas/register-tenant`, { ...formData, planTier: selectedPlan });
      
      const data = response.data;
      setTenantInfo(data);
      setAdminData(prev => ({ ...prev, username: formData.registeredMobile }));

      const isPaidPlan = selectedPlan !== 'free' && selectedPlan !== 'TRIAL';
      if (isPaidPlan) {
        setCurrentStep('PAYMENT');
      } else {
        setCurrentStep('ADMIN_SETUP');
      }
    } catch (err) {
      setResult({ success: false, message: err.response?.data?.error || 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Payment Integration
  const handlePayment = async () => {
    if (tenantInfo?.orderSessionId && window.Cashfree) {
      const mode = isLocalhost ? 'sandbox' : 'production';
      const cashfree = window.Cashfree({ mode });
      cashfree.checkout({
        paymentSessionId: tenantInfo.orderSessionId,
        redirectTarget: "_self"
      });
    } else {
      setCurrentStep('ADMIN_SETUP');
    }
  };

  // Step 3: Admin Setup
  const handleAdminSetup = async (e) => {
    e.preventDefault();
    if (adminData.password !== adminData.confirmPassword) {
      setResult({ success: false, message: 'Passwords do not match' });
      return;
    }
    if (adminData.password.length < 6) {
      setResult({ success: false, message: 'Password must be at least 6 characters long' });
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      await axios.post(`${apiUrl}/api/users/setup-admin`, {
        username: adminData.username,
        password: adminData.password,
        tenantId: tenantInfo?.tenantId
      });

      setCurrentStep('COMPLETE');
      setResult({
        success: true,
        message: 'Admin account created successfully! Workspace is now fully activated.',
        fullLoginUrl: tenantInfo?.fullLoginUrl
      });
    } catch (err) {
      setResult({ success: false, message: err.response?.data?.message || 'Failed to setup admin account' });
    } finally {
      setLoading(false);
    }
  };

  const openRegisterModal = (plan = 'free') => {
    setSelectedPlan(plan);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-500/20">
      
      {/* Light Gradient Subtle Highlights */}
      <div className="fixed top-0 right-0 w-[800px] h-[600px] bg-gradient-to-b from-sky-100/60 via-blue-50/40 to-transparent blur-3xl pointer-events-none z-0"></div>
      
      {/* Fixed Top Header Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm w-full">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.location.href = '/'}>
            <img src={brandLogo} alt="TransitNode Logo" className="h-8 w-auto object-contain" />
            <span className="text-xl font-extrabold tracking-tight text-slate-900">Transit<span className="text-[#187baa]">Node</span></span>
          </div>

          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-[#187baa] transition-colors">Page 1</a>
            <a href="#solutions" className="hover:text-[#187baa] transition-colors">Page 1</a>
            <a href="#tracking" className="hover:text-[#187baa] transition-colors">Page 1</a>
            <a href="#pricing" className="hover:text-[#187baa] transition-colors">Page 1</a>
            <a href="#about" className="hover:text-[#187baa] transition-colors">Page 1</a>
          </div>

          <div className="flex items-center space-x-5">
            <a href="/login" className="text-sm font-semibold text-slate-700 hover:text-[#187baa] transition-colors">Log In</a>
            <button 
              onClick={() => openRegisterModal('free')}
              className="bg-[#187baa] hover:bg-[#14668f] text-white font-semibold text-sm px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
            >
              <span>Start Free Trial</span>
              <span>→</span>
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-28 sm:pt-32 pb-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Copy */}
          <div className="lg:col-span-6 flex flex-col space-y-6">
            <div className="font-['Inter'] font-semibold text-[15px] leading-none uppercase" style={{ color: 'rgba(19, 107, 207, 1)' }}>
              GLOBAL LOGISTICS. SMARTER TOMORROW
            </div>

            <h1 className="font-['Inter'] font-extrabold text-[36px] sm:text-[46px] lg:text-[55px] uppercase" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: '55px', lineHeight: '100%', letterSpacing: '0%', color: '#000000' }}>
              ENTERPRISE FLEET CONTROL. ZERO FRICTION.
            </h1>

            <p className="font-['Inter'] font-normal text-[18px] leading-[150%] max-w-xl" style={{ color: 'rgba(0, 0, 0, 0.6)' }}>
              Enjoy your speakers and hard, predesignat language, applying, and client corporate. 70 suspects.
            </p>

            {/* Checklist */}
            <div className="space-y-3 pt-2">
              {[
                'Scale Global Logistics',
                'Fleet management',
                'Logistics networks',
                'Connected vehicles',
                'International routes'
              ].map((item, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <img src="/check_circle.svg" alt="Check Icon" className="w-5 h-5 flex-shrink-0" />
                  <span className="font-['Inter'] font-normal text-[15px] leading-[150%]" style={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA Action Row */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button 
                onClick={() => openRegisterModal('free')}
                className="bg-[#187baa] hover:bg-[#14668f] text-white font-semibold text-sm px-7 py-3.5 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center space-x-2"
              >
                <span>Start Free Trial</span>
                <span>→</span>
              </button>

              <button 
                onClick={() => openRegisterModal('free')}
                className="bg-transparent hover:opacity-80 transition-all flex items-center space-x-2 py-2"
              >
                <img src="/play_circle.svg" alt="Play Icon" className="w-7 h-7 flex-shrink-0" />
                <span className="font-['Inter'] font-normal text-[15px] leading-[150%]" style={{ color: 'rgba(28, 27, 31, 1)' }}>
                  Watch Overview
                </span>
              </button>
            </div>
          </div>

          {/* Right Hero Graphic */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-2xl drop-shadow-xl">
              <img 
                src={useSvg ? "/hero_display.svg" : "/hero_display.png"} 
                onError={() => setUseSvg(false)} 
                alt="Enterprise Fleet Control Display" 
                className="w-full h-auto object-contain rounded-2xl"
              />
            </div>
          </div>

        </div>

        {/* KPI Counter Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16 border-t border-slate-100 mt-16 max-w-5xl">
          <div>
            <div className="font-['Inter'] font-semibold text-[25px] leading-[150%]" style={{ color: 'rgba(0, 0, 0, 1)' }}>1M+</div>
            <div className="font-['Inter'] font-normal text-[15px] leading-[150%]" style={{ color: 'rgba(28, 27, 31, 1)' }}>Vehicles Connected</div>
          </div>
          <div>
            <div className="font-['Inter'] font-semibold text-[25px] leading-[150%]" style={{ color: 'rgba(0, 0, 0, 1)' }}>150+</div>
            <div className="font-['Inter'] font-normal text-[15px] leading-[150%]" style={{ color: 'rgba(28, 27, 31, 1)' }}>Vehicles Connected</div>
          </div>
          <div>
            <div className="font-['Inter'] font-semibold text-[25px] leading-[150%]" style={{ color: 'rgba(0, 0, 0, 1)' }}>99.9%</div>
            <div className="font-['Inter'] font-normal text-[15px] leading-[150%]" style={{ color: 'rgba(28, 27, 31, 1)' }}>Vehicles Connected</div>
          </div>
          <div>
            <div className="font-['Inter'] font-semibold text-[25px] leading-[150%]" style={{ color: 'rgba(0, 0, 0, 1)' }}>24/7</div>
            <div className="font-['Inter'] font-normal text-[15px] leading-[150%]" style={{ color: 'rgba(28, 27, 31, 1)' }}>Vehicles Connected</div>
          </div>
        </div>
      </section>

      {/* Operational Volume Tier Pricing Section */}
      <section id="pricing" className="container mx-auto px-6 py-20 relative z-10 border-t border-slate-100">
        <div className="text-center mb-16 space-y-2">
          <div className="font-['Inter'] font-semibold text-[15px] leading-none uppercase text-center" style={{ color: 'rgba(19, 107, 207, 1)' }}>
            FLEXIBLE PLANING FOR EVERY STAGE
          </div>
          <h2 className="font-['Inter'] font-extrabold text-[26px] sm:text-[35px] leading-none text-center" style={{ color: 'rgba(0, 0, 0, 1)' }}>
            SELECT YOUR OPERATIONAL VOLUME TIER
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          
          {/* Card 1 - Blue Accent */}
          <div className="bg-white border-2 border-blue-500/80 rounded-2xl p-6 flex flex-col justify-between shadow-md hover:shadow-xl transition-all duration-300 relative group">
            <div>
              <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-1">TRANCEZARDS</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">10 Day Exploration</h3>
              <p className="text-slate-500 text-xs leading-relaxed mb-6 font-normal">
                Baila hold denning fast fine glara from free tosed soce.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center text-xs font-medium text-slate-700">
                  <div className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] mr-2 flex-shrink-0">✓</div>
                  <span>Scale Global Logistics</span>
                </div>
                <div className="flex items-center text-xs font-medium text-slate-700">
                  <div className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] mr-2 flex-shrink-0">✓</div>
                  <span>Fleet management</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <div className="text-[10px] text-slate-400 uppercase font-semibold mb-1">Price</div>
              <div className="text-3xl font-extrabold text-slate-900 mb-5">₹0</div>
              <button 
                onClick={() => openRegisterModal('free')}
                className="w-full bg-[#187baa] hover:bg-[#14668f] text-white font-semibold text-xs py-3 rounded-lg shadow transition-all flex items-center justify-center space-x-1"
              >
                <span>Start Free Trial</span>
                <span>→</span>
              </button>
            </div>
          </div>

          {/* Card 2 - Emerald/Teal Accent */}
          <div className="bg-white border-2 border-emerald-500/80 rounded-2xl p-6 flex flex-col justify-between shadow-md hover:shadow-xl transition-all duration-300 relative group">
            <div>
              <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider mb-1">TRANCEZARDS</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">10 Day Exploration</h3>
              <p className="text-slate-500 text-xs leading-relaxed mb-6 font-normal">
                Baila hold denning fast fine glara from free tosed soce.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center text-xs font-medium text-slate-700">
                  <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] mr-2 flex-shrink-0">✓</div>
                  <span>Scale Global Logistics</span>
                </div>
                <div className="flex items-center text-xs font-medium text-slate-700">
                  <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] mr-2 flex-shrink-0">✓</div>
                  <span>Fleet management</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <div className="text-[10px] text-slate-400 uppercase font-semibold mb-1">Price</div>
              <div className="text-3xl font-extrabold text-slate-900 mb-5">₹50k</div>
              <button 
                onClick={() => openRegisterModal('silver')}
                className="w-full bg-[#0d9488] hover:bg-[#0f766e] text-white font-semibold text-xs py-3 rounded-lg shadow transition-all flex items-center justify-center space-x-1"
              >
                <span>Upgrade to 1 Year</span>
                <span>→</span>
              </button>
            </div>
          </div>

          {/* Card 3 - Orange/Amber Accent */}
          <div className="bg-white border-2 border-amber-500/80 rounded-2xl p-6 flex flex-col justify-between shadow-md hover:shadow-xl transition-all duration-300 relative group">
            <div>
              <div className="text-[11px] font-bold text-amber-600 uppercase tracking-wider mb-1">TRANCEZARDS</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">10 Day Exploration</h3>
              <p className="text-slate-500 text-xs leading-relaxed mb-6 font-normal">
                Baila hold denning fast fine glara from free tosed soce.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center text-xs font-medium text-slate-700">
                  <div className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] mr-2 flex-shrink-0">✓</div>
                  <span>Scale Global Logistics</span>
                </div>
                <div className="flex items-center text-xs font-medium text-slate-700">
                  <div className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] mr-2 flex-shrink-0">✓</div>
                  <span>Fleet management</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <div className="text-[10px] text-slate-400 uppercase font-semibold mb-1">Price</div>
              <div className="text-3xl font-extrabold text-slate-900 mb-5">₹50k</div>
              <button 
                onClick={() => openRegisterModal('platinum')}
                className="w-full bg-[#d97706] hover:bg-[#b45309] text-white font-semibold text-xs py-3 rounded-lg shadow transition-all flex items-center justify-center space-x-1"
              >
                <span>Upgrade to 1 Year</span>
                <span>→</span>
              </button>
            </div>
          </div>

          {/* Card 4 - Purple Accent */}
          <div className="bg-white border-2 border-purple-500/80 rounded-2xl p-6 flex flex-col justify-between shadow-md hover:shadow-xl transition-all duration-300 relative group">
            <div>
              <div className="text-[11px] font-bold text-purple-600 uppercase tracking-wider mb-1">TRANCEZARDS</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">10 Day Exploration</h3>
              <p className="text-slate-500 text-xs leading-relaxed mb-6 font-normal">
                Baila hold denning fast fine glara from free tosed soce.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center text-xs font-medium text-slate-700">
                  <div className="w-4 h-4 rounded-full bg-purple-500 text-white flex items-center justify-center text-[10px] mr-2 flex-shrink-0">✓</div>
                  <span>Scale Global Logistics</span>
                </div>
                <div className="flex items-center text-xs font-medium text-slate-700">
                  <div className="w-4 h-4 rounded-full bg-purple-500 text-white flex items-center justify-center text-[10px] mr-2 flex-shrink-0">✓</div>
                  <span>Fleet management</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <div className="text-[10px] text-slate-400 uppercase font-semibold mb-1">Price</div>
              <div className="text-3xl font-extrabold text-slate-900 mb-5">₹50k</div>
              <button 
                onClick={() => openRegisterModal('lifetime')}
                className="w-full bg-[#6d28d9] hover:bg-[#5b21b6] text-white font-semibold text-xs py-3 rounded-lg shadow transition-all flex items-center justify-center space-x-1"
              >
                <span>Upgrade to 1 Year</span>
                <span>→</span>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Testimonials Review Cards Section */}
      <section className="container mx-auto px-6 py-20 relative z-10 border-t border-slate-100">
        <div className="text-center mb-16 space-y-2">
          <div className="font-['Inter'] font-semibold text-[15px] leading-none uppercase text-center" style={{ color: 'rgba(19, 107, 207, 1)' }}>
            FLEXIBLE PLANING FOR EVERY STAGE
          </div>
          <h2 className="font-['Inter'] font-extrabold text-[26px] sm:text-[35px] leading-none text-center" style={{ color: 'rgba(0, 0, 0, 1)' }}>
            SELECT YOUR OPERATIONAL VOLUME TIER
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((t, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                {/* 4.5 Star Rating */}
                <div className="flex items-center space-x-1 mb-5">
                  <StarIcon />
                  <StarIcon />
                  <StarIcon />
                  <StarIcon />
                  <HalfStarIcon />
                </div>

                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-8 font-normal">
                  {t.quote}
                </p>
              </div>

              <div className="flex items-center space-x-4 pt-4 border-t border-slate-100">
                <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                <div>
                  <div className="font-bold text-slate-900 text-xs">{t.name}</div>
                  <div className="text-slate-500 text-[11px] font-medium">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 pt-16 pb-12 relative z-10 text-slate-600 text-xs">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-100">
          
          {/* Col 1: About Us */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img src={brandLogo} alt="TransitNode Logo" className="h-7 w-auto object-contain" />
              <span className="text-lg font-extrabold text-slate-900 tracking-tight">Transit<span className="text-[#187baa]">Node</span></span>
            </div>
            <div className="font-bold text-slate-900 text-xs uppercase tracking-wider">About Us</div>
            <p className="text-slate-500 text-xs leading-relaxed font-normal">
              We are a growing logistics and transportation company committed to providing reliable, efficient and customer-focused logistics solutions across worldwide.
            </p>
            <a href="#about" className="inline-block text-[#187baa] font-semibold text-xs hover:underline">Learn More</a>
          </div>

          {/* Col 2: Contacts */}
          <div className="space-y-3">
            <div className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">Contacts</div>
            <div className="text-slate-700 font-semibold">+91 757 839 7539</div>
            <div>
              <a href="mailto:connect@gmail.com" className="text-[#187baa] underline hover:text-[#14668f]">connect@gmail.com</a>
            </div>
            <p className="text-slate-500 leading-relaxed">
              Plot No. D68/30, Near Ganapati Temple, Kharghar, Sector 12, Navi Mumbai - 410210
            </p>
          </div>

          {/* Col 3: Main Links */}
          <div className="space-y-3">
            <div className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">Main Links</div>
            <ul className="space-y-2 font-medium">
              <li><a href="#why-us" className="hover:text-[#187baa] transition-colors">Why Us?</a></li>
              <li><a href="#about" className="hover:text-[#187baa] transition-colors">About Us</a></li>
              <li><a href="#contact" className="hover:text-[#187baa] transition-colors">Contact Us</a></li>
              <li><a href="#partner" className="hover:text-[#187baa] transition-colors">Become a Partner</a></li>
            </ul>
          </div>

          {/* Col 4: Social */}
          <div className="space-y-4">
            <div className="font-bold text-slate-900 text-xs uppercase tracking-wider">Social</div>
            <div className="flex items-center space-x-3">
              <a href="#" className="w-8 h-8 rounded-lg bg-[#187baa] text-white flex items-center justify-center font-bold text-xs hover:bg-[#14668f] transition-colors">f</a>
              <a href="#" className="w-8 h-8 rounded-lg bg-[#187baa] text-white flex items-center justify-center font-bold text-xs hover:bg-[#14668f] transition-colors">in</a>
              <a href="#" className="w-8 h-8 rounded-lg bg-[#187baa] text-white flex items-center justify-center font-bold text-xs hover:bg-[#14668f] transition-colors">tw</a>
              <a href="#" className="w-8 h-8 rounded-lg bg-[#187baa] text-white flex items-center justify-center font-bold text-xs hover:bg-[#14668f] transition-colors">yt</a>
            </div>
          </div>

        </div>

        {/* Bottom copyright bar */}
        <div className="container mx-auto px-6 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-slate-500">
          <div className="flex flex-wrap items-center gap-6">
            <span>© 2026 GoSky</span>
            <a href="#" className="hover:text-slate-800">Sitemap</a>
            <a href="/terms-of-service" className="hover:text-slate-800">Terms of Use</a>
            <a href="/privacy-policy" className="hover:text-slate-800">Privacy and Data Protection Notice</a>
            <a href="#" className="hover:text-slate-800">Cookie Settings</a>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex space-x-2 text-slate-600 font-bold">
              <span>in</span>
              <span>f</span>
              <span>tw</span>
              <span>yt</span>
            </div>
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-[#187baa] font-semibold hover:underline">
              Back to top ↑
            </button>
          </div>
        </div>
      </footer>
      
      {/* Interactive SaaS Registration Portal Modal */}
      {showModal && (
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
      )}
    </div>
  );
};

export default PricingPortal;
