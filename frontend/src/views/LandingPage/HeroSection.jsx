import React from 'react';

const HeroSection = ({ openRegisterModal }) => {
  return (
    <section className="w-full relative z-10 pt-28 sm:pt-32 pb-12 overflow-hidden">
      
      {/* Full-Bleed Right Hero Graphic - Flush against bottom border of fixed header (0px space) */}
      <div className="hidden lg:flex absolute right-0 top-[68px] bottom-0 w-[56%] xl:w-[60%] items-start justify-end pointer-events-none z-10">
        <img 
          src="/hero_display.svg" 
          onError={(e) => { e.currentTarget.src = '/hero_display.png'; }}
          alt="Enterprise Fleet Control Display" 
          className="w-full h-auto lg:h-full object-contain object-right-top"
        />
      </div>

      <div className="container mx-auto px-6 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Hero Copy */}
          <div className="lg:col-span-6 flex flex-col space-y-6 z-20">
            <div className="font-['Inter'] font-semibold text-[15px] leading-none uppercase" style={{ color: 'rgba(19, 107, 207, 1)' }}>
              GLOBAL LOGISTICS. SMARTER TOMORROW
            </div>

            <h1 className="font-['Inter'] font-extrabold text-[36px] sm:text-[46px] lg:text-[55px] uppercase" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: '55px', lineHeight: '100%', letterSpacing: '0%', color: '#000000', WebkitTextFillColor: '#000000', background: 'none' }}>
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
            <div className="flex flex-wrap items-center gap-5 pt-4">
              <button 
                onClick={() => openRegisterModal('free')}
                className="bg-[#136bcf] hover:bg-[#0f5bb3] text-white font-semibold text-sm px-7 py-3 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
              >
                <span>Start Free Trial</span>
                <span>→</span>
              </button>

              <button 
                onClick={() => openRegisterModal('free')}
                className="bg-[#ffffff] hover:opacity-80 transition-all flex items-center space-x-2 py-2"
              >
                <img src="/play_circle.svg" alt="Play Icon" className="w-7 h-7 flex-shrink-0" />
                <span className="font-['Inter'] font-normal text-[15px] leading-[150%]" style={{ color: 'rgba(28, 27, 31, 1)' }}>
                  Watch Overview
                </span>
              </button>
            </div>
          </div>

          {/* Mobile Fallback Image */}
          <div className="block lg:hidden mt-8">
            <img 
              src="/hero_display.svg" 
              onError={(e) => { e.currentTarget.src = '/hero_display.png'; }}
              alt="Enterprise Fleet Control Display" 
              className="w-full h-auto object-contain"
            />
          </div>

        </div>
      </div>

      {/* KPI Counter Stats Strip */}
      <div className="pt-16 border-t border-slate-100 mt-16 max-w-6xl mx-auto px-6 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          <div className="px-2 md:px-6 py-2 md:py-0">
            <div className="font-['Inter'] font-semibold text-[25px] leading-[150%]" style={{ color: 'rgba(0, 0, 0, 1)' }}>1M+</div>
            <div className="font-['Inter'] font-normal text-[15px] leading-[150%]" style={{ color: 'rgba(28, 27, 31, 1)' }}>Vehicles Connected</div>
          </div>
          <div className="px-2 md:px-6 py-2 md:py-0">
            <div className="font-['Inter'] font-semibold text-[25px] leading-[150%]" style={{ color: 'rgba(0, 0, 0, 1)' }}>150+</div>
            <div className="font-['Inter'] font-normal text-[15px] leading-[150%]" style={{ color: 'rgba(28, 27, 31, 1)' }}>Vehicles Connected</div>
          </div>
          <div className="px-2 md:px-6 py-2 md:py-0">
            <div className="font-['Inter'] font-semibold text-[25px] leading-[150%]" style={{ color: 'rgba(0, 0, 0, 1)' }}>99.9%</div>
            <div className="font-['Inter'] font-normal text-[15px] leading-[150%]" style={{ color: 'rgba(28, 27, 31, 1)' }}>Vehicles Connected</div>
          </div>
          <div className="px-2 md:px-6 py-2 md:py-0">
            <div className="font-['Inter'] font-semibold text-[25px] leading-[150%]" style={{ color: 'rgba(0, 0, 0, 1)' }}>24/7</div>
            <div className="font-['Inter'] font-normal text-[15px] leading-[150%]" style={{ color: 'rgba(28, 27, 31, 1)' }}>Vehicles Connected</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
