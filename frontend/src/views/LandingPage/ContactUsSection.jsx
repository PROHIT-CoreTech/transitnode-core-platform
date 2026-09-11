import React from 'react';

const ContactUsSection = () => {
  return (
    <section id="contact" className="container mx-auto px-6 py-20 lg:py-24 relative z-10 border-t border-slate-100 scroll-mt-24">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <div className="font-['Inter'] font-semibold text-[13px] tracking-wider uppercase mb-3" style={{ color: 'rgba(19, 107, 207, 1)' }}>
          GET IN TOUCH
        </div>
        <h2 className="font-['Inter'] font-extrabold text-[28px] sm:text-[36px] leading-tight uppercase" style={{ color: '#000000', WebkitTextFillColor: '#000000', background: 'none' }}>
          WE'RE HERE TO HELP YOU SCALE YOUR FLEET
        </h2>
        <p className="font-['Inter'] font-normal text-[15px] sm:text-[16px] leading-relaxed mt-4 max-w-2xl mx-auto" style={{ color: 'rgba(0, 0, 0, 0.6)' }}>
          Have questions about enterprise custom plans, API integrations, or hardware compatibility? Our specialist team is ready to assist.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-6xl mx-auto">
        {/* Left Info Cards */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
            <div className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-2">Corporate Headquarters</div>
            <p className="text-slate-600 text-sm leading-relaxed">
              Plot No. D68/30, Near Ganapati Temple,<br />
              Kharghar, Sector 12, Navi Mumbai - 410210, India
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
            <div className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-2">Direct Phone Support</div>
            <div className="text-[#187baa] font-bold text-lg">+91 757 839 7539</div>
            <div className="text-slate-500 text-xs mt-1">Available Monday to Saturday, 9:00 AM - 7:00 PM IST</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
            <div className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-2">Email Operations</div>
            <a href="mailto:connect@gmail.com" className="text-[#187baa] font-semibold text-base hover:underline">
              connect@gmail.com
            </a>
            <div className="text-slate-500 text-xs mt-1">Typical response time: under 2 hours</div>
          </div>
        </div>

        {/* Right Interactive Form */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <h3 className="font-['Inter'] font-bold text-xl text-slate-900 mb-6">Send Us a Message</h3>
          <form onSubmit={(e) => { e.preventDefault(); alert('Thank you for contacting TransitNode! Our team will reach out to you shortly.'); }} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Full Name</label>
                <input type="text" required placeholder="John Doe" className="w-full px-4 py-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#187baa] focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Mobile Number</label>
                <input type="tel" required placeholder="+91 98765 43210" className="w-full px-4 py-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#187baa] focus:outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Work Email</label>
                <input type="email" required placeholder="john@company.com" className="w-full px-4 py-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#187baa] focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Fleet Size</label>
                <select className="w-full px-4 py-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#187baa] focus:outline-none bg-white">
                  <option>1 - 10 Vehicles</option>
                  <option>11 - 50 Vehicles</option>
                  <option>51 - 200 Vehicles</option>
                  <option>200+ Vehicles</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Message / Requirement</label>
              <textarea rows="4" required placeholder="Tell us about your fleet requirements..." className="w-full px-4 py-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#187baa] focus:outline-none"></textarea>
            </div>

            <button type="submit" className="w-full bg-[#187baa] hover:bg-[#14668f] text-white font-semibold text-sm py-3.5 rounded-lg shadow transition-all">
              Submit Inquiry →
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactUsSection;
