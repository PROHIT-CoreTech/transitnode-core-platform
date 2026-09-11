import React from 'react';

const AboutUsSection = () => {
  return (
    <section id="about" className="container mx-auto px-4 sm:px-6 py-20 lg:py-24 relative z-10 border-t border-slate-100 scroll-mt-24">
      <div className="max-w-4xl mx-auto text-center mb-12 sm:mb-16">
        <div className="font-['Inter'] font-semibold text-xs sm:text-[13px] tracking-wider uppercase mb-2 sm:mb-3" style={{ color: 'rgba(19, 107, 207, 1)' }}>
          OUR VISION & MISSION
        </div>
        <h2 className="font-['Inter'] font-extrabold text-[22px] sm:text-[36px] leading-snug sm:leading-tight uppercase" style={{ color: '#000000', WebkitTextFillColor: '#000000', background: 'none' }}>
          REVOLUTIONIZING THE LOGISTICS BACKBONE ACROSS INDIA & GLOBALLY
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 max-w-6xl mx-auto items-center">
        <div className="lg:col-span-7 space-y-4 sm:space-y-6">
          <h3 className="font-['Inter'] font-bold text-xl sm:text-2xl text-slate-900 leading-snug">
            Empowering transport operators and supply chains with intelligent cloud automation.
          </h3>
          <p className="font-['Inter'] font-normal text-xs sm:text-base text-slate-600 leading-relaxed">
            TransitNode was built from the ground up to solve the core challenges of modern fleet management. From regional logistics operators to multi-state commercial fleets, our mission is to eliminate operational friction and give decision-makers real-time clarity.
          </p>
          <p className="font-['Inter'] font-normal text-xs sm:text-base text-slate-600 leading-relaxed">
            Our cloud-native platform combines live IoT telemetry, automated dispatching, driver safety analytics, and transparent financial reporting in one unified dashboard.
          </p>
        </div>

        <div className="lg:col-span-5 grid grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-6 text-center">
            <div className="font-['Inter'] font-extrabold text-2xl sm:text-3xl text-slate-900 mb-1">99.9%</div>
            <div className="font-['Inter'] font-medium text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider">Uptime SLA</div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-6 text-center">
            <div className="font-['Inter'] font-extrabold text-2xl sm:text-3xl text-[#187baa] mb-1">50K+</div>
            <div className="font-['Inter'] font-medium text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider">Vehicles Tracked</div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-6 text-center">
            <div className="font-['Inter'] font-extrabold text-2xl sm:text-3xl text-[#187baa] mb-1">&lt;50ms</div>
            <div className="font-['Inter'] font-medium text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider">Telemetry Latency</div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-6 text-center">
            <div className="font-['Inter'] font-extrabold text-2xl sm:text-3xl text-slate-900 mb-1">30%</div>
            <div className="font-['Inter'] font-medium text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider">Cost Reduction</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUsSection;
