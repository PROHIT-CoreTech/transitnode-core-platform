import React from 'react';

const AboutUsSection = () => {
  return (
    <section id="about" className="container mx-auto px-6 py-20 lg:py-24 relative z-10 border-t border-slate-100 scroll-mt-24">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <div className="font-['Inter'] font-semibold text-[13px] tracking-wider uppercase mb-3" style={{ color: 'rgba(19, 107, 207, 1)' }}>
          OUR VISION & MISSION
        </div>
        <h2 className="font-['Inter'] font-extrabold text-[28px] sm:text-[36px] leading-tight uppercase" style={{ color: '#000000', WebkitTextFillColor: '#000000', background: 'none' }}>
          REVOLUTIONIZING THE LOGISTICS BACKBONE ACROSS INDIA & GLOBALLY
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-6xl mx-auto items-center">
        <div className="lg:col-span-7 space-y-6">
          <h3 className="font-['Inter'] font-bold text-2xl text-slate-900 leading-snug">
            Empowering transport operators and supply chains with intelligent cloud automation.
          </h3>
          <p className="font-['Inter'] font-normal text-base text-slate-600 leading-relaxed">
            TransitNode was built from the ground up to solve the core challenges of modern fleet management. From regional logistics operators to multi-state commercial fleets, our mission is to eliminate operational friction and give decision-makers real-time clarity.
          </p>
          <p className="font-['Inter'] font-normal text-base text-slate-600 leading-relaxed">
            Our cloud-native platform combines live IoT telemetry, automated dispatching, driver safety analytics, and transparent financial reporting in one unified dashboard.
          </p>
        </div>

        <div className="lg:col-span-5 grid grid-cols-2 gap-4">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center">
            <div className="font-['Inter'] font-extrabold text-3xl text-slate-900 mb-1">99.9%</div>
            <div className="font-['Inter'] font-medium text-xs text-slate-500 uppercase tracking-wider">Uptime SLA</div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center">
            <div className="font-['Inter'] font-extrabold text-3xl text-[#187baa] mb-1">50K+</div>
            <div className="font-['Inter'] font-medium text-xs text-slate-500 uppercase tracking-wider">Vehicles Tracked</div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center">
            <div className="font-['Inter'] font-extrabold text-3xl text-[#187baa] mb-1">&lt;50ms</div>
            <div className="font-['Inter'] font-medium text-xs text-slate-500 uppercase tracking-wider">Telemetry Latency</div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center">
            <div className="font-['Inter'] font-extrabold text-3xl text-slate-900 mb-1">30%</div>
            <div className="font-['Inter'] font-medium text-xs text-slate-500 uppercase tracking-wider">Cost Reduction</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUsSection;
