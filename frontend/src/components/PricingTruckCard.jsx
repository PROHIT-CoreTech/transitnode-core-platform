import React from 'react';

const Wheel = () => (
  <div className="w-12 h-12 rounded-full bg-slate-900 border-[3px] border-slate-700 flex items-center justify-center shadow-lg relative z-20">
    {/* Inner metal rim */}
    <div className="w-7 h-7 rounded-full bg-slate-400 border-2 border-slate-600 flex items-center justify-center">
      {/* Hubcap center */}
      <div className="w-2.5 h-2.5 rounded-full bg-slate-800"></div>
    </div>
    {/* Tire Treads style ring */}
    <div className="absolute inset-0.5 rounded-full border border-slate-800/30 pointer-events-none"></div>
  </div>
);

const PricingTruckCard = ({
  title = "5-Year Control Tower",
  price = "₹1.00L",
  duration = "60 Months (5 Years)",
  description = "Unrestricted access to the entire logistics operating system.",
  features = [
    "Unlimited asset & driver counts",
    "Advanced compliance vaults",
    "Full system feature availability",
    "Priority 24/7 technical support"
  ],
  ctaText = "Secure Enterprise Plan",
  onCtaClick = () => {},
  badgeText = "Best Enterprise Value"
}) => {
  return (
    <div className="relative w-full max-w-5xl mx-auto my-12 pb-8">
      {/* Semi-Truck Chassis / Shadow Line */}
      <div className="absolute bottom-6 left-8 right-8 h-2 bg-slate-900 rounded-full blur-sm opacity-50 z-0"></div>

      {/* Main Truck Frame Wrapper */}
      <div className="relative z-10 w-full bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row min-h-[380px] backdrop-blur-xl">
        
        {/* Left Panel: The Trailer (Features & CTA) */}
        <div className="flex-1 bg-gradient-to-r from-slate-900 to-slate-950 p-8 lg:p-10 flex flex-col justify-between z-10">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <span className="h-2 w-8 bg-amber-500 rounded-full"></span>
              <span className="text-amber-500 text-xs font-extrabold uppercase tracking-widest">Trailer Cargo</span>
            </div>
            
            <h3 className="text-2xl lg:text-3xl font-extrabold text-white mb-2">{title}</h3>
            <p className="text-slate-400 text-sm max-w-xl font-light mb-6 leading-relaxed">
              {description}
            </p>
            
            <div className="border-t border-slate-800/80 pt-6">
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {features.map((feature, idx) => (
                  <li key={idx} className="flex items-start text-slate-300 text-sm">
                    <svg className="w-5 h-5 text-amber-500 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="leading-tight">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-xs text-slate-500 italic max-w-xs leading-relaxed">
              Includes full localized driver app access and direct corporate Tally ERP export files.
            </p>
            <button
              onClick={onCtaClick}
              className="bg-white hover:bg-slate-100 text-slate-900 font-extrabold px-8 py-4 rounded-xl transition-all duration-300 shadow-lg shadow-white/5 active:scale-98 whitespace-nowrap text-sm tracking-wide"
            >
              {ctaText}
            </button>
          </div>
        </div>

        {/* Right Panel: The Cabin (Pricing & Tier) */}
        <div className="w-full lg:w-72 bg-amber-500 relative flex flex-col justify-center items-center p-8 lg:p-10 text-slate-900 text-center select-none overflow-hidden min-h-[220px] lg:min-h-full">
          {/* Aerodynamic wind-shield glass accent (Top Right Windshield Polygon) */}
          <div 
            className="absolute top-0 right-0 w-36 h-20 bg-slate-950/90 border-l border-b border-slate-800 hidden lg:block"
            style={{ clipPath: 'polygon(20% 0%, 100% 80%, 100% 100%, 0% 100%)' }}
          >
            {/* Windshield glare effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 transform rotate-12"></div>
          </div>

          {/* Cabin Side-Window Cutout Graphic */}
          <div className="absolute top-4 left-6 w-20 h-14 bg-slate-950/80 rounded-tl-xl rounded-br-xl border-l-2 border-amber-600 hidden lg:block">
            {/* Mock Driver outline subtle element */}
            <div className="absolute bottom-2 left-4 w-4 h-4 bg-slate-800/80 rounded-full"></div>
            <div className="absolute bottom-0 left-2 w-8 h-2 bg-slate-800/80 rounded-t-sm"></div>
          </div>

          <div className="relative z-10 flex flex-col items-center">
            {badgeText && (
              <span className="mb-4 bg-slate-950 text-amber-400 text-[10px] font-extrabold uppercase px-3 py-1.5 rounded-full tracking-wider shadow-md">
                {badgeText}
              </span>
            )}
            
            <span className="text-sm font-bold uppercase tracking-widest text-amber-950 opacity-80">
              Subscription Cost
            </span>
            <span className="text-5xl font-black tracking-tight mt-1 mb-2 text-slate-950 drop-shadow-sm">
              {price}
            </span>
            <span className="text-xs font-bold text-amber-950 opacity-85 bg-amber-600/25 px-3 py-1 rounded-md">
              {duration}
            </span>
          </div>

          {/* Corner Aerodynamic Grill Accents (Bottom Front Cabin details) */}
          <div className="absolute bottom-4 right-4 flex flex-col space-y-1 opacity-20 hidden lg:flex">
            <div className="w-12 h-1 bg-slate-950 rounded-full"></div>
            <div className="w-10 h-1 bg-slate-950 rounded-full"></div>
            <div className="w-8 h-1 bg-slate-950 rounded-full"></div>
          </div>
        </div>

      </div>

      {/* Heavy Dual Tandem Axles (Wheels positioned under chassis wrapper) */}
      
      {/* Front Wheel: Single axle steering wheel under the front cabin area */}
      <div className="absolute bottom-2 right-12 z-0 hidden lg:block">
        <Wheel />
      </div>

      {/* Middle Wheels: Dual tandem drive axles at the back of the tractor cab */}
      <div className="absolute bottom-2 right-64 flex space-x-1 z-0 hidden lg:block">
        <Wheel />
        <Wheel />
      </div>

      {/* Rear Wheels: Dual tandem trailer axles at the very back of the cargo trailer */}
      <div className="absolute bottom-2 left-12 flex space-x-1 z-0 hidden lg:block">
        <Wheel />
        <Wheel />
      </div>

    </div>
  );
};

export default PricingTruckCard;
