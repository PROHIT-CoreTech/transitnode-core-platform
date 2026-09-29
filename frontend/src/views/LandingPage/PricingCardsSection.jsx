import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DEFAULT_FALLBACK_PLANS = [
  {
    planKey: 'TRIAL',
    title: '10 Day Exploration',
    badgeText: 'TRANCEZARDS',
    tagline: 'Start exploring all transit management capabilities.',
    price: 0,
    priceDisplay: '₹0',
    features: ['Scale Global Logistics', 'Fleet management'],
    buttonText: 'Start Free Trial',
    accentColor: 'blue'
  },
  {
    planKey: 'SILVER',
    title: 'Silver Plan',
    badgeText: 'TRANCEZARDS',
    tagline: 'Ideal for growing regional fleet operators.',
    price: 50000,
    priceDisplay: '₹50k',
    features: ['Scale Global Logistics', 'Fleet management'],
    buttonText: 'Upgrade to 3 Years',
    accentColor: 'emerald'
  },
  {
    planKey: 'PLATINUM',
    title: 'Platinum Plan',
    badgeText: 'TRANCEZARDS',
    tagline: 'Enterprise logistics with multi-company management.',
    price: 50000,
    priceDisplay: '₹50k',
    features: ['Scale Global Logistics', 'Fleet management', 'Multi-Company Portal'],
    buttonText: 'Upgrade to 5 Years',
    accentColor: 'amber'
  },
  {
    planKey: 'LIFETIME',
    title: 'Lifetime Access',
    badgeText: 'TRANCEZARDS',
    tagline: 'Unlimited perpetual access for scaling enterprises.',
    price: 50000,
    priceDisplay: '₹50k',
    features: ['Scale Global Logistics', 'Fleet management', 'Multi-Company Portal', 'Custom Branding & Subdomain'],
    buttonText: 'Upgrade to Lifetime',
    accentColor: 'purple'
  }
];

const ACCENT_STYLES = {
  blue: {
    border: 'border-blue-500/80',
    badgeText: 'text-blue-600',
    checkBg: 'bg-blue-500',
    btnBg: 'bg-[#187baa] hover:bg-[#14668f]'
  },
  emerald: {
    border: 'border-emerald-500/80',
    badgeText: 'text-emerald-600',
    checkBg: 'bg-emerald-500',
    btnBg: 'bg-[#0d9488] hover:bg-[#0f766e]'
  },
  amber: {
    border: 'border-amber-500/80',
    badgeText: 'text-amber-600',
    checkBg: 'bg-amber-500',
    btnBg: 'bg-[#d97706] hover:bg-[#b45309]'
  },
  purple: {
    border: 'border-purple-500/80',
    badgeText: 'text-purple-600',
    checkBg: 'bg-purple-500',
    btnBg: 'bg-[#6d28d9] hover:bg-[#5b21b6]'
  }
};

const PricingCardsSection = ({ openRegisterModal, plansProp }) => {
  const [plans, setPlans] = useState(plansProp || DEFAULT_FALLBACK_PLANS);

  useEffect(() => {
    if (!plansProp) {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      axios.get(`${apiUrl}/api/saas/plans`)
        .then(res => {
          if (res.data?.plans && res.data.plans.length > 0) {
            setPlans(res.data.plans);
          }
        })
        .catch(err => {
          console.warn('Could not fetch dynamic plans, using default presentation:', err);
        });
    } else {
      setPlans(plansProp);
    }
  }, [plansProp]);

  return (
    <section id="pricing" className="container mx-auto px-4 sm:px-6 py-20 lg:py-24 relative z-10 border-t border-slate-100 scroll-mt-24">
      <div className="text-center mb-12 sm:mb-16 space-y-2">
        <h2 className="font-['Inter'] font-extrabold text-[24px] sm:text-[35px] leading-snug sm:leading-none text-center" style={{ color: 'rgba(0, 0, 0, 1)' }}>
          SELECT YOUR OPERATIONAL VOLUME TIER
        </h2>
        <p className="text-xs text-slate-400 md:hidden font-medium">Swipe cards horizontally →</p>
      </div>

      {/* Dynamic Grid */}
      <div className="flex md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 max-w-7xl mx-auto overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-6 md:pb-0 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
        {plans.map((plan, index) => {
          const colorKey = plan.accentColor || (index === 0 ? 'blue' : index === 1 ? 'emerald' : index === 2 ? 'amber' : 'purple');
          const style = ACCENT_STYLES[colorKey] || ACCENT_STYLES.blue;
          const planKeyLower = (plan.planKey || 'TRIAL').toLowerCase();

          return (
            <div 
              key={plan._id || plan.planKey || index}
              className={`flex-shrink-0 w-[85%] sm:w-[290px] md:w-auto snap-center bg-white border-2 ${style.border} rounded-2xl p-6 flex flex-col justify-between shadow-md hover:shadow-xl transition-all duration-300 relative group`}
            >
              <div>
                <div className={`text-[11px] font-bold ${style.badgeText} uppercase tracking-wider mb-1 flex items-center justify-between`}>
                  <span>{plan.badgeText || 'TRANCEZARDS'}</span>
                  {plan.isPopular && (
                    <span className="bg-amber-100 text-amber-800 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase">POPULAR</span>
                  )}
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed mb-6 font-normal min-h-[36px]">
                  {plan.tagline || 'Baila hold denning fast fine glara from free tosed soce.'}
                </p>

                <div className="space-y-3 mb-8">
                  {(plan.features || []).map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-center text-xs font-medium text-slate-700">
                      <div className={`w-4 h-4 rounded-full ${style.checkBg} text-white flex items-center justify-center text-[10px] mr-2 flex-shrink-0`}>✓</div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="text-[10px] text-slate-400 uppercase font-semibold mb-1">Price</div>
                <div className="flex items-baseline space-x-2 mb-5">
                  <span className="text-3xl font-extrabold text-slate-900">
                    {plan.priceDisplay || `₹${plan.price >= 1000 ? (plan.price / 1000) + 'k' : plan.price}`}
                  </span>
                  {plan.originalPrice > plan.price && (
                    <span className="text-xs text-slate-400 line-through font-semibold">
                      ₹{plan.originalPrice >= 1000 ? (plan.originalPrice / 1000) + 'k' : plan.originalPrice}
                    </span>
                  )}
                </div>

                <button 
                  onClick={() => openRegisterModal(planKeyLower === 'trial' ? 'free' : planKeyLower, plan)}
                  className={`w-full ${style.btnBg} text-white font-semibold text-xs py-3 rounded-lg shadow transition-all flex items-center justify-center space-x-1`}
                >
                  <span>{plan.buttonText || (planKeyLower === 'free' || planKeyLower === 'trial' ? 'Start Free Trial' : 'Upgrade Plan')}</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default PricingCardsSection;
