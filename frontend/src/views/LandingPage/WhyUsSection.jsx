import React from 'react';

const WhyUsSection = () => {
  return (
    <section id="why-us" className="container mx-auto px-6 py-20 lg:py-24 relative z-10 border-t border-slate-100 scroll-mt-24">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <div className="font-['Inter'] font-semibold text-[13px] tracking-wider uppercase mb-3" style={{ color: 'rgba(19, 107, 207, 1)' }}>
          WHY CHOOSE TRANSITNODE
        </div>
        <h2 className="font-['Inter'] font-extrabold text-[28px] sm:text-[36px] leading-tight uppercase" style={{ color: '#000000', WebkitTextFillColor: '#000000', background: 'none' }}>
          ENGINEERED FOR UNMATCHED FLEET EFFICIENCY & ZERO DOWNTIME
        </h2>
        <p className="font-['Inter'] font-normal text-[15px] sm:text-[16px] leading-relaxed mt-4 max-w-2xl mx-auto" style={{ color: 'rgba(0, 0, 0, 0.6)' }}>
          We provide next-generation fleet intelligence, unifying GPS tracking, driver behavior monitoring, automated fuel reconciliation, and multi-tenant security into a single platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Card 1 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#187baa] flex items-center justify-center font-bold text-xl mb-6">
            01
          </div>
          <h3 className="font-['Inter'] font-bold text-xl text-slate-900 mb-3">
            Real-Time Telematics & AI Diagnostics
          </h3>
          <p className="font-['Inter'] font-normal text-sm text-slate-600 leading-relaxed">
            Sub-second vehicle telemetry, engine health alerts, and instant route optimization keep your fleet moving at peak productivity with zero unexpected breakdowns.
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#187baa] flex items-center justify-center font-bold text-xl mb-6">
            02
          </div>
          <h3 className="font-['Inter'] font-bold text-xl text-slate-900 mb-3">
            Automated Fuel & Expense Control
          </h3>
          <p className="font-['Inter'] font-normal text-sm text-slate-600 leading-relaxed">
            Detect fuel theft in real time, reconcile fuel pump receipts automatically, and optimize fuel economy per vehicle to cut operating costs by up to 25%.
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#187baa] flex items-center justify-center font-bold text-xl mb-6">
            03
          </div>
          <h3 className="font-['Inter'] font-bold text-xl text-slate-900 mb-3">
            Isolated Multi-Tenant Security
          </h3>
          <p className="font-['Inter'] font-normal text-sm text-slate-600 leading-relaxed">
            Each organization gets dedicated database schemas, customized domain endpoints, end-to-end data encryption, and role-based operational permissions.
          </p>
        </div>

        {/* Card 4 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#187baa] flex items-center justify-center font-bold text-xl mb-6">
            04
          </div>
          <h3 className="font-['Inter'] font-bold text-xl text-slate-900 mb-3">
            Instant Setup & Seamless Scaling
          </h3>
          <p className="font-['Inter'] font-normal text-sm text-slate-600 leading-relaxed">
            Deploy your workspace in under 60 seconds with self-service onboarding, integrated payment gateways, and scalable API connectors for hardware devices.
          </p>
        </div>
      </div>
    </section>
  );
};

export default WhyUsSection;
