import React from 'react';
import brandLogo from '../../assets/brand_logo.png';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 pt-12 pb-12 relative z-10 text-slate-600 text-xs">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-100">
        
        {/* Col 1: About Us */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <img src={brandLogo} alt="TransitNode Logo" className="h-7 w-auto object-contain" />
            <span className="text-lg font-extrabold text-slate-900 tracking-tight">Transit<span className="text-[#187baa]">Node</span></span>
          </div>
          <div className="font-bold text-slate-900 text-xs uppercase tracking-wider">About Us</div>
          <p className="text-slate-500 text-xs leading-relaxed font-normal">
            We are a growing logistics and transportation company committed to providing reliable, efficient and customer-focused logistics solutions across worldwide.
          </p>
          <a href="#about" className="inline-block text-[#187baa] font-semibold text-xs hover:underline">Learn More</a>
        </div>

        {/* Col 2: Contacts */}
        <div className="space-y-3">
          <div className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">Contacts</div>
          <div className="text-slate-700 font-semibold">+91 757 839 7539</div>
          <div>
            <a href="mailto:connect@gmail.com" className="text-[#187baa] underline hover:text-[#14668f]">connect@gmail.com</a>
          </div>
          <p className="text-slate-500 leading-relaxed">
            Plot No. D68/30, Near Ganapati Temple, Kharghar, Sector 12, Navi Mumbai - 410210
          </p>
        </div>

        {/* Col 3: Navigation */}
        <div className="space-y-3">
          <div className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">Navigation</div>
          <ul className="space-y-2 font-medium">
            <li><a href="#why-us" className="hover:text-[#187baa] transition-colors">Why Us?</a></li>
            <li><a href="#about" className="hover:text-[#187baa] transition-colors">About Us</a></li>
            <li><a href="#contact" className="hover:text-[#187baa] transition-colors">Contact Us</a></li>
          </ul>
        </div>

        {/* Col 4: Social */}
        <div className="space-y-4">
          <div className="font-bold text-slate-900 text-xs uppercase tracking-wider">Social</div>
          <div className="flex items-center space-x-3">
            <a href="#" className="w-8 h-8 rounded-lg bg-[#187baa] text-white flex items-center justify-center font-bold text-xs hover:bg-[#14668f] transition-colors">f</a>
            <a href="#" className="w-8 h-8 rounded-lg bg-[#187baa] text-white flex items-center justify-center font-bold text-xs hover:bg-[#14668f] transition-colors">in</a>
            <a href="#" className="w-8 h-8 rounded-lg bg-[#187baa] text-white flex items-center justify-center font-bold text-xs hover:bg-[#14668f] transition-colors">tw</a>
            <a href="#" className="w-8 h-8 rounded-lg bg-[#187baa] text-white flex items-center justify-center font-bold text-xs hover:bg-[#14668f] transition-colors">yt</a>
          </div>
        </div>

      </div>

      {/* Bottom copyright bar */}
      <div className="container mx-auto px-6 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-slate-500">
        <div className="flex flex-wrap items-center gap-6">
          <span>© 2026 GoSky</span>
          <a href="#" className="hover:text-slate-800">Sitemap</a>
          <a href="/terms-of-service" className="hover:text-slate-800">Terms of Use</a>
          <a href="/privacy-policy" className="hover:text-slate-800">Privacy and Data Protection Notice</a>
          <a href="#" className="hover:text-slate-800">Cookie Settings</a>
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex space-x-2 text-slate-600 font-bold">
            <span>in</span>
            <span>f</span>
            <span>tw</span>
            <span>yt</span>
          </div>
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-[#187baa] font-semibold hover:underline">
            Back to top ↑
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
