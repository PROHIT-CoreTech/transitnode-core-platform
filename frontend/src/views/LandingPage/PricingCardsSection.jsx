import React from 'react';

const PricingCardsSection = ({ openRegisterModal }) => {
  return (
    <section id="pricing" className="container mx-auto px-6 py-20 lg:py-24 relative z-10 border-t border-slate-100 scroll-mt-24">
      <div className="text-center mb-16 space-y-2">
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
  );
};

export default PricingCardsSection;
