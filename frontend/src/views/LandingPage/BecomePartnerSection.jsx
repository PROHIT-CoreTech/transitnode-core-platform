import React from 'react';

const BecomePartnerSection = () => {
  return (
    <section id="partner" className="container mx-auto px-6 py-24 relative z-10 border-t border-slate-100 scroll-mt-24">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <div className="font-['Inter'] font-semibold text-[13px] tracking-wider uppercase mb-3" style={{ color: 'rgba(19, 107, 207, 1)' }}>
          PARTNER PROGRAM
        </div>
        <h2 className="font-['Inter'] font-extrabold text-[28px] sm:text-[36px] leading-tight uppercase" style={{ color: '#000000', WebkitTextFillColor: '#000000', background: 'none' }}>
          JOIN OUR GROWING ECOSYSTEM OF LOGISTICS & TELEMATICS PARTNERS
        </h2>
        <p className="font-['Inter'] font-normal text-[15px] sm:text-[16px] leading-relaxed mt-4 max-w-2xl mx-auto" style={{ color: 'rgba(0, 0, 0, 0.6)' }}>
          Expand your portfolio with TransitNode's enterprise infrastructure. We provide competitive margin structures, white-label options, and dedicated technical support.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
        {/* Partner Track 1 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-[#187baa] uppercase tracking-wider mb-2">Track 01</div>
            <h3 className="font-['Inter'] font-bold text-xl text-slate-900 mb-4">System Integrators & ERP</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6 font-normal">
              Integrate TransitNode real-time GPS telemetry, fuel APIs, and trip data directly into SAP, Oracle, or custom client ERP systems.
            </p>
          </div>
          <ul className="space-y-2 text-xs text-slate-600 pt-4 border-t border-slate-100 font-medium">
            <li className="flex items-center"><span className="text-[#187baa] mr-2">✓</span> REST & WebSocket APIs</li>
            <li className="flex items-center"><span className="text-[#187baa] mr-2">✓</span> Sandbox Environments</li>
            <li className="flex items-center"><span className="text-[#187baa] mr-2">✓</span> Co-Selling Support</li>
          </ul>
        </div>

        {/* Partner Track 2 */}
        <div className="bg-white border-2 border-[#187baa] rounded-2xl p-8 shadow-md hover:shadow-xl transition-all flex flex-col justify-between relative">
          <div className="absolute -top-3 right-6 bg-[#187baa] text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full">
            Most Popular
          </div>
          <div>
            <div className="text-xs font-bold text-[#187baa] uppercase tracking-wider mb-2">Track 02</div>
            <h3 className="font-['Inter'] font-bold text-xl text-slate-900 mb-4">Resellers & Channel Partners</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6 font-normal">
              Offer TransitNode software subscriptions to your transport network and earn generous recurring commissions with zero maintenance burden.
            </p>
          </div>
          <ul className="space-y-2 text-xs text-slate-600 pt-4 border-t border-slate-100 font-medium">
            <li className="flex items-center"><span className="text-[#187baa] mr-2">✓</span> Up to 35% Recurring Margins</li>
            <li className="flex items-center"><span className="text-[#187baa] mr-2">✓</span> Dedicated Partner Manager</li>
            <li className="flex items-center"><span className="text-[#187baa] mr-2">✓</span> Marketing Collateral</li>
          </ul>
        </div>

        {/* Partner Track 3 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-[#187baa] uppercase tracking-wider mb-2">Track 03</div>
            <h3 className="font-['Inter'] font-bold text-xl text-slate-900 mb-4">Hardware & OEM Partners</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6 font-normal">
              Certify your GPS hardware, fuel sensors, OBD dongles, or Dashcams for pre-built compatibility with the TransitNode platform.
            </p>
          </div>
          <ul className="space-y-2 text-xs text-slate-600 pt-4 border-t border-slate-100 font-medium">
            <li className="flex items-center"><span className="text-[#187baa] mr-2">✓</span> Hardware Certification</li>
            <li className="flex items-center"><span className="text-[#187baa] mr-2">✓</span> Featured in Partner Directory</li>
            <li className="flex items-center"><span className="text-[#187baa] mr-2">✓</span> Direct Technical Testing</li>
          </ul>
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={() => alert('Partnership application opened! Contact connect@gmail.com to complete registration.')}
          className="bg-[#187baa] hover:bg-[#14668f] text-white font-semibold text-sm px-8 py-3.5 rounded-lg shadow-lg hover:shadow-xl transition-all"
        >
          Apply for Partnership →
        </button>
      </div>
    </section>
  );
};

export default BecomePartnerSection;
