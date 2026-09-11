import React from 'react';

const HeroSection = ({ openRegisterModal }) => {
  return (
    <section className="w-full relative z-10 pt-24 sm:pt-32 pb-12 overflow-hidden">
      
      {/* Full-Bleed Right Hero Graphic - Flush against bottom border of fixed header (0px space) */}
      <div className="hidden lg:flex absolute right-0 top-[68px] bottom-0 w-[56%] xl:w-[60%] items-start justify-end pointer-events-none z-10">
        <img 
          src="/hero_display.svg" 
          onError={(e) => { e.currentTarget.src = '/hero_display.png'; }}
          alt="Enterprise Fleet Control Display" 
          className="w-full h-auto lg:h-full object-contain object-right-top"
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Hero Copy */}
          <div className="lg:col-span-6 flex flex-col space-y-4 sm:space-y-6 z-20">
            <div className="font-['Inter'] font-semibold text-xs sm:text-[15px] leading-none uppercase" style={{ color: 'rgba(19, 107, 207, 1)' }}>
              GLOBAL LOGISTICS. SMARTER TOMORROW
            </div>

            <h1 className="font-['Inter'] font-extrabold text-[28px] sm:text-[42px] lg:text-[55px] uppercase leading-[1.15] sm:leading-[1.05] tracking-tight" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, color: '#000000', WebkitTextFillColor: '#000000', background: 'none' }}>
              ENTERPRISE FLEET CONTROL. ZERO FRICTION.
            </h1>

            <p className="font-['Inter'] font-normal text-sm sm:text-[18px] leading-[150%] max-w-xl" style={{ color: 'rgba(0, 0, 0, 0.6)' }}>
              Enjoy your speakers and hard, predesignat language, applying, and client corporate. 70 suspects.
            </p>

            {/* Checklist */}
            <div className="space-y-2.5 sm:space-y-3 pt-1">
              {[
                'Scale Global Logistics',
                'Fleet management',
                'Logistics networks',
                'Connected vehicles',
                'International routes'
              ].map((item, i) => (
                <div key={i} className="flex items-center space-x-2.5 sm:space-x-3">
                  <img src="/check_circle.svg" alt="Check Icon" className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="font-['Inter'] font-normal text-xs sm:text-[15px] leading-[150%]" style={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA Action Row */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-5 pt-3">
              <button 
                onClick={() => openRegisterModal('free')}
                className="bg-[#136bcf] hover:bg-[#0f5bb3] text-white font-semibold text-xs sm:text-sm px-5 sm:px-7 py-2.5 sm:py-3 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
              >
                <span>Start Free Trial</span>
                <span>→</span>
              </button>

              <button 
                onClick={() => openRegisterModal('free')}
                className="bg-white hover:opacity-80 transition-all flex items-center space-x-2 py-2"
              >
                <img src="/play_circle.svg" alt="Play Icon" className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0" />
                <span className="font-['Inter'] font-normal text-xs sm:text-[15px] leading-[150%]" style={{ color: 'rgba(28, 27, 31, 1)' }}>
                  Watch Overview
                </span>
              </button>
            </div>
          </div>

          {/* Mobile Graphic Display */}
          <div className="block lg:hidden mt-6">
            <img 
              src="/hero_display.svg" 
              onError={(e) => { e.currentTarget.src = '/hero_display.png'; }}
              alt="Enterprise Fleet Control Display" 
              className="w-full h-auto object-contain max-h-[300px] mx-auto drop-shadow-md"
            />
          </div>

        </div>
      </div>

      {/* KPI Counter Stats Strip */}
      <div className="pt-10 sm:pt-16 border-t border-slate-100 mt-10 sm:mt-16 max-w-6xl mx-auto px-4 sm:px-6 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-0 divide-y-0 md:divide-x divide-slate-200">
          <div className="px-2 md:px-6 py-2 md:py-0 text-center md:text-left">
            <div className="font-['Inter'] font-semibold text-xl sm:text-[25px] leading-tight" style={{ color: 'rgba(0, 0, 0, 1)' }}>1M+</div>
            <div className="font-['Inter'] font-normal text-xs sm:text-[15px] leading-snug" style={{ color: 'rgba(28, 27, 31, 1)' }}>Vehicles Connected</div>
          </div>
          <div className="px-2 md:px-6 py-2 md:py-0 text-center md:text-left">
            <div className="font-['Inter'] font-semibold text-xl sm:text-[25px] leading-tight" style={{ color: 'rgba(0, 0, 0, 1)' }}>150+</div>
            <div className="font-['Inter'] font-normal text-xs sm:text-[15px] leading-snug" style={{ color: 'rgba(28, 27, 31, 1)' }}>Global Networks</div>
          </div>
          <div className="px-2 md:px-6 py-2 md:py-0 text-center md:text-left">
            <div className="font-['Inter'] font-semibold text-xl sm:text-[25px] leading-tight" style={{ color: 'rgba(0, 0, 0, 1)' }}>99.9%</div>
            <div className="font-['Inter'] font-normal text-xs sm:text-[15px] leading-snug" style={{ color: 'rgba(28, 27, 31, 1)' }}>Operational Uptime</div>
          </div>
          <div className="px-2 md:px-6 py-2 md:py-0 text-center md:text-left">
            <div className="font-['Inter'] font-semibold text-xl sm:text-[25px] leading-tight" style={{ color: 'rgba(0, 0, 0, 1)' }}>24/7</div>
            <div className="font-['Inter'] font-normal text-xs sm:text-[15px] leading-snug" style={{ color: 'rgba(28, 27, 31, 1)' }}>Support SLA</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
