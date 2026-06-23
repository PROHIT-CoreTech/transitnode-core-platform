import React, { useState } from 'react';
import axios from 'axios';
import PricingTruckCard from '../../components/PricingTruckCard';

const CheckIcon = ({ className = "w-6 h-6 text-teal-600 mx-auto" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
  </svg>
);

const DashIcon = () => (
  <svg className="w-6 h-6 text-slate-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path>
  </svg>
);

const HexagonLogo = () => (
  <svg className="w-10 h-10 text-teal-700" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.2L2.5 7.7v11l9.5 5.5 9.5-5.5v-11L12 2.2zm0 2.3l7.5 4.3v8.6l-7.5 4.3-7.5-4.3V8.8L12 4.5z"/>
    <path d="M12 7l4.5 2.6v5.2L12 17.4l-4.5-2.6V9.6L12 7z"/>
  </svg>
);

const TruckIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13"></rect>
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
    <circle cx="5.5" cy="18.5" r="2.5"></circle>
    <circle cx="18.5" cy="18.5" r="2.5"></circle>
  </svg>
);

const PricingPortal = () => {
  const features = [
    { name: "Multi-Language Driver Interface", free: true, silver: true, platinum: true, lifetime: true },
    { name: "Automated Geofence OTP Verification", free: false, silver: true, platinum: true, lifetime: true },
    { name: "Excel & Tally XML Export Suite", free: false, silver: true, platinum: true, lifetime: true },
    { name: "Real-Time P&L and Balance Sheet compilation", free: false, silver: false, platinum: true, lifetime: true },
  ];

  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('free');
  const [formData, setFormData] = useState({
    companyName: '',
    registeredMobile: '',
    customSubdomain: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const testimonials = [
    {
      name: "William Alex",
      role: "Founder @LogisticsCorp",
      image: "https://i.pravatar.cc/150?img=11",
      text: "\"Highly recommend PROHIT CoreTech they helped me a lot. I love their work experience and best effort, I got best product design by them and excellent solution, in future we work again them, Thankful to the agency for given such as services.\"",
      bgColor: "bg-[#eefcf8]",
      iconColor: "bg-teal-500 text-white",
      iconPath: "M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"
    },
    {
      name: "Madhu Mia",
      role: "Founder @FleetMaster",
      image: "https://i.pravatar.cc/150?img=68",
      text: "\"The multi-language support allowed our drivers across different states to adopt the app immediately. We've seen a 40% reduction in reporting delays and complete visibility into our fleet metrics.\"",
      bgColor: "bg-[#f8f7fc]",
      iconColor: "bg-indigo-500 text-white",
      iconPath: "M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
    },
    {
      name: "Sarah Jenkins",
      role: "Operations @FastTrack",
      image: "https://i.pravatar.cc/150?img=47",
      text: "\"Using the direct Tally ERP export has saved our accounting team hundreds of hours each month. The compliance vault ensures we never miss a vehicle renewal date again. Absolute game changer.\"",
      bgColor: "bg-[#fffbf0]",
      iconColor: "bg-amber-500 text-white",
      iconPath: "M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"
    }
  ];

  React.useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_URL || 'http://localhost:3000';
      const response = await axios.post(`${apiUrl}/api/saas/register-tenant`, { ...formData, planTier: selectedPlan });
      setResult({ success: true, message: response.data.message });
    } catch (err) {
      setResult({ success: false, message: err.response?.data?.error || 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-teal-500/30 overflow-x-hidden relative">
      <style>
        {`
          @keyframes driveRight {
            0% { transform: translateX(-150px); opacity: 0; }
            5% { opacity: 1; }
            95% { opacity: 1; }
            100% { transform: translateX(110vw); opacity: 0; }
          }
          @keyframes floatCloud {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          .animate-drive {
            animation: driveRight 20s linear infinite;
          }
          .animate-drive-delayed {
            animation: driveRight 25s linear infinite;
            animation-delay: 8s;
          }
          .animate-cloud {
            animation: floatCloud 6s ease-in-out infinite;
          }
        `}
      </style>

      {/* Background Fleet Animation Layer */}
      <div className="absolute top-40 left-0 right-0 h-64 pointer-events-none z-0 overflow-hidden opacity-20">
        <div className="absolute top-10 -left-32 animate-drive text-slate-400">
          <TruckIcon className="w-24 h-24" />
        </div>
        <div className="absolute top-24 -left-32 animate-drive-delayed text-teal-600">
          <TruckIcon className="w-16 h-16" />
        </div>
        {/* Clouds */}
        <div className="absolute top-4 left-[20%] text-slate-300 animate-cloud">
          <svg className="w-32 h-16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 19c2.5 0 4.5-2 4.5-4.5S20 10 17.5 10c-.3 0-.6 0-.8.1-.5-2.6-2.8-4.6-5.7-4.6-3.3 0-6 2.7-6 6 0 .2 0 .5.1.7C3.1 12.6 1.5 14.6 1.5 17c0 2.8 2.2 5 5 5h11z"/></svg>
        </div>
        <div className="absolute top-12 left-[70%] text-slate-300 animate-cloud" style={{ animationDelay: '2s' }}>
          <svg className="w-24 h-12" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 19c2.5 0 4.5-2 4.5-4.5S20 10 17.5 10c-.3 0-.6 0-.8.1-.5-2.6-2.8-4.6-5.7-4.6-3.3 0-6 2.7-6 6 0 .2 0 .5.1.7C3.1 12.6 1.5 14.6 1.5 17c0 2.8 2.2 5 5 5h11z"/></svg>
        </div>
      </div>

      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 flex justify-between items-center border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <HexagonLogo />
          <span className="text-2xl font-extrabold tracking-tight text-slate-800">
            PROHIT CORETECH<span className="text-teal-600">.</span>
          </span>
        </div>
        <button onClick={() => { setSelectedPlan('free'); setShowModal(true); }} className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 shadow-xl shadow-teal-600/20 active:scale-95">
          Start 10-Day Trial
        </button>
      </nav>

      {/* Hero Segment */}
      <header className="container mx-auto px-6 py-24 text-center max-w-5xl relative">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        
        <div className="inline-block mb-4 px-5 py-2 rounded-full bg-white border border-teal-100 text-teal-800 text-sm font-bold tracking-widest shadow-sm uppercase">
          White-Label Logistics ERP
        </div>
        
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight text-slate-900">
          Enterprise Fleet Control. <br className="hidden md:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-700 to-teal-500">
            Zero Friction.
          </span>
        </h1>
        
        <p className="text-xl text-slate-600 mb-8 leading-relaxed max-w-3xl mx-auto font-light">
          Scale your operations with automated telemetry tracking, localized multi-language driver applications, and direct corporate Tally ERP export files.
        </p>
      </header>

      {/* Featured Fleet Flagship Tier */}
      <section className="container mx-auto px-6 py-8 relative z-10">
        <PricingTruckCard 
          onCtaClick={() => { setSelectedPlan('platinum'); setShowModal(true); }}
        />
      </section>

      {/* Other Fleet Packages */}
      <section className="container mx-auto px-6 pb-24 relative z-10">
        <div className="text-center mb-12">
          <h3 className="text-2xl font-bold text-slate-800">Additional Subscription Tiers</h3>
          <p className="text-slate-500 text-sm mt-2">Choose the scope that matches your operational cargo volume</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto w-full">
          {/* Free Trial */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 flex flex-col hover:-translate-y-2 hover:border-slate-300 hover:shadow-2xl transition-all duration-300 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-200 to-slate-300 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
            <h3 className="text-xl font-bold mb-3 text-slate-900">10-Day Exploration</h3>
            <p className="text-slate-500 mb-6 min-h-[60px] text-sm leading-relaxed">Perfect for testing our core capabilities on a limited scale.</p>
            <div className="mb-8">
              <span className="text-4xl font-extrabold text-slate-900">₹0</span>
            </div>
            <ul className="space-y-4 mb-12 flex-1">
              <li className="flex items-start text-slate-700 text-sm">
                <CheckIcon className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                <span className="ml-3">Restricted vehicle mapping counts</span>
              </li>
              <li className="flex items-start text-slate-700 text-sm">
                <CheckIcon className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                <span className="ml-3">Basic multi-language app access</span>
              </li>
            </ul>
            <button onClick={() => { setSelectedPlan('free'); setShowModal(true); }} className="w-full mt-auto bg-slate-50 hover:bg-slate-100 text-slate-800 py-3 rounded-xl font-bold transition-colors border border-slate-200 text-sm">
              Start Free Trial
            </button>
          </div>

          {/* Silver Plan */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 flex flex-col hover:-translate-y-2 hover:border-slate-300 hover:shadow-2xl transition-all duration-300 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-200 to-slate-400 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
            <h3 className="text-xl font-bold mb-3 text-slate-900">3-Year Acceleration</h3>
            <p className="text-slate-500 mb-6 min-h-[60px] text-sm leading-relaxed">Ideal for growing fleets needing deep operational integration.</p>
            <div className="mb-8">
              <span className="text-4xl font-extrabold text-slate-900">₹50k</span>
            </div>
            <ul className="space-y-4 mb-12 flex-1">
              <li className="flex items-start text-slate-700 text-sm">
                <CheckIcon className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                <span className="ml-3">Long-term structural savings</span>
              </li>
              <li className="flex items-start text-slate-700 text-sm">
                <CheckIcon className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                <span className="ml-3">Full Tally XML integration</span>
              </li>
              <li className="flex items-start text-slate-700 text-sm">
                <CheckIcon className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                <span className="ml-3">25 active vehicle tracking nodes</span>
              </li>
            </ul>
            <button onClick={() => { setSelectedPlan('silver'); setShowModal(true); }} className="w-full mt-auto bg-slate-50 hover:bg-slate-100 text-slate-800 py-3 rounded-xl font-bold transition-colors border border-slate-200 text-sm">
              Upgrade to Silver
            </button>
          </div>

          {/* Lifetime Plan */}
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-8 flex flex-col border border-amber-400 shadow-2xl shadow-amber-500/30 relative transform hover:-translate-y-4 transition-all duration-300 z-10 text-white group overflow-hidden">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors duration-500 pointer-events-none"></div>
            <h3 className="text-xl font-bold mb-3 text-white">Lifetime Ownership</h3>
            <p className="text-amber-100 mb-6 min-h-[60px] text-sm leading-relaxed">Pay once, own the ecosystem forever. No recurring fees.</p>
            <div className="mb-8">
              <span className="text-4xl font-extrabold text-white">₹5.00L</span>
            </div>
            <ul className="space-y-4 mb-12 flex-1">
              <li className="flex items-start text-white text-sm">
                <CheckIcon className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                <span className="ml-3">Never pay subscription fees again</span>
              </li>
              <li className="flex items-start text-white text-sm">
                <CheckIcon className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                <span className="ml-3">Lifetime platinum benefits</span>
              </li>
              <li className="flex items-start text-white text-sm">
                <CheckIcon className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                <span className="ml-3 font-semibold">VIP white-glove onboarding</span>
              </li>
            </ul>
            <button onClick={() => { setSelectedPlan('lifetime'); setShowModal(true); }} className="w-full mt-auto bg-white hover:bg-slate-50 text-amber-600 py-3 rounded-xl font-bold transition-all shadow-lg text-sm">
              Unlock Lifetime
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-6 py-24">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16">
            <div className="max-w-xl">
              <div className="flex items-center space-x-4 mb-4">
                <div className="h-px w-12 bg-slate-400"></div>
                <span className="text-slate-600 font-semibold tracking-wide uppercase text-sm">Testimonials</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight">
                Hear what our amazing<br/>customers say
              </h2>
            </div>
            <div className="max-w-md mt-6 md:mt-0 text-slate-600 text-lg leading-relaxed border-l-2 border-slate-200 pl-6">
              Our enterprise logistics platform is built for heavy-duty fleet operations. We offer premium support with access to advanced tracking facilities to scale your business effortlessly.
            </div>
          </div>

          {/* Carousel Area */}
          <div className="flex items-center justify-between gap-4">
            {/* Left Arrow */}
            <button 
              onClick={() => setActiveTestimonial(prev => prev === 0 ? testimonials.length - 1 : prev - 1)}
              className="hidden md:flex w-12 h-12 rounded-full bg-slate-900 text-white items-center justify-center hover:bg-teal-600 transition-colors shadow-lg flex-shrink-0 z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            </button>

            {/* Cards */}
            <div className="flex-1 rounded-xl overflow-hidden shadow-2xl shadow-slate-200/50 relative">
              <div 
                className="flex transition-transform duration-700 ease-in-out h-full"
                style={{ transform: `translateX(-${activeTestimonial * 100}%)` }}
              >
                {testimonials.map((t, idx) => (
                  <div key={idx} className={`min-w-full w-full flex-shrink-0 ${t.bgColor} p-12 md:p-16 flex flex-col justify-between`}>
                    <div className="max-w-4xl mx-auto w-full">
                      <div className={`w-14 h-14 ${t.iconColor} flex items-center justify-center mb-8 rounded-xl shadow-sm transform -rotate-6`}>
                        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d={t.iconPath}/></svg>
                      </div>
                      <p className="text-slate-700 text-xl md:text-2xl leading-relaxed mb-10 font-medium italic">
                        {t.text}
                      </p>
                      <div className="flex items-center space-x-5">
                        <div className="w-16 h-16 rounded-full bg-slate-300 overflow-hidden shadow-md ring-4 ring-white">
                          <img src={t.image} alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-lg">{t.name}</h4>
                          <p className="text-teal-600 font-medium text-sm tracking-wide uppercase mt-1">{t.role}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Arrow */}
            <button 
              onClick={() => setActiveTestimonial(prev => prev === testimonials.length - 1 ? 0 : prev + 1)}
              className="hidden md:flex w-12 h-12 rounded-full bg-slate-900 text-white items-center justify-center hover:bg-teal-600 transition-colors shadow-lg flex-shrink-0 z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </button>
          </div>

          {/* Dots */}
          <div className="flex justify-center items-center space-x-3 mt-10">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTestimonial(idx)}
                className={`h-2 rounded-full transition-all duration-500 ${
                  activeTestimonial === idx 
                    ? 'w-10 bg-teal-500 shadow-md shadow-teal-500/40' 
                    : 'w-2 bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label={`Go to testimonial ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Registration Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
          <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-lg overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="p-10">
              <h3 className="text-3xl font-extrabold mb-3 text-slate-900">Start Your Registration</h3>
              <p className="text-slate-500 mb-8 text-lg">
                Provision your dedicated tenant workspace instantly.
                <span className="block mt-2 text-teal-600 font-semibold uppercase text-sm tracking-wide">Selected Tier: {selectedPlan}</span>
              </p>
              
              {result ? (
                <div className={`p-6 rounded-2xl mb-8 ${result.success ? 'bg-teal-50 text-teal-800 border border-teal-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                  {result.message}
                </div>
              ) : null}

              {result?.success ? (
                <div className="pt-6 flex justify-end">
                  <button type="button" onClick={() => setShowModal(false)} className="bg-teal-600 hover:bg-teal-500 text-white px-8 py-3 rounded-xl font-bold transition-all text-center shadow-lg shadow-teal-600/25 text-lg">Done</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 tracking-wide uppercase">Company Name</label>
                    <input required type="text" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-slate-900 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all outline-none" placeholder="Acme Logistics" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 tracking-wide uppercase">Mobile Number</label>
                    <input required type="tel" value={formData.registeredMobile} onChange={e => setFormData({...formData, registeredMobile: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-slate-900 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all outline-none" placeholder="+91 9876543210" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 tracking-wide uppercase">Target Subdomain</label>
                    <div className="flex shadow-sm rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500">
                      <input required type="text" value={formData.customSubdomain} onChange={e => setFormData({...formData, customSubdomain: e.target.value})} className="w-full bg-slate-50 border border-slate-200 border-r-0 px-5 py-4 text-slate-900 focus:bg-white focus:outline-none transition-all" placeholder="acme" />
                      <span className="bg-slate-100 border border-slate-200 border-l-0 text-slate-500 px-5 py-4 font-medium flex items-center">.prohitcoretech.in</span>
                    </div>
                  </div>
                  <div className="pt-8 flex items-center justify-end space-x-4 border-t border-slate-100">
                    <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 rounded-xl font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all text-lg">Cancel</button>
                    <button type="submit" disabled={loading} className="bg-teal-600 hover:bg-teal-500 text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg shadow-teal-600/25 text-lg flex items-center">
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Provisioning...
                        </>
                      ) : 'Complete Registration'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-20">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12 border-b border-slate-800 pb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <HexagonLogo />
                <span className="text-2xl font-extrabold tracking-tight text-white">
                  PROHIT CORETECH<span className="text-teal-500">.</span>
                </span>
              </div>
              <p className="max-w-md text-slate-500 text-lg leading-relaxed mb-6">
                Next-generation enterprise logistics operating system for heavy-duty fleet control, telematics, and automated accounting.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-teal-500 hover:text-white transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-teal-500 hover:text-white transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-bold text-lg mb-6">Platform</h4>
              <ul className="space-y-4">
                <li><a href="#" className="hover:text-teal-400 transition-colors">Fleet Tracking</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Tally Export</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Compliance Vault</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Financial Engine</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold text-lg mb-6">Company</h4>
              <ul className="space-y-4">
                <li><a href="#" className="hover:text-teal-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
            <p>&copy; {new Date().getFullYear()} PROHIT CoreTech. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">System Status</a>
              <a href="#" className="hover:text-white transition-colors">Security</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default PricingPortal;
