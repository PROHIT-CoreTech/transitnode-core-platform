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
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-9 h-9 rounded-xl bg-[#187baa] text-white flex items-center justify-center hover:bg-[#14668f] hover:scale-105 transition-all shadow-sm">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-9 h-9 rounded-xl bg-[#187baa] text-white flex items-center justify-center hover:bg-[#14668f] hover:scale-105 transition-all shadow-sm">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
              </svg>
            </a>
            <a href="https://x.com" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" className="w-9 h-9 rounded-xl bg-[#187baa] text-white flex items-center justify-center hover:bg-[#14668f] hover:scale-105 transition-all shadow-sm">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="w-9 h-9 rounded-xl bg-[#187baa] text-white flex items-center justify-center hover:bg-[#14668f] hover:scale-105 transition-all shadow-sm">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
          </div>
        </div>

      </div>

      {/* Bottom copyright bar */}
      <div className="container mx-auto px-6 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-slate-500">
        <div className="flex flex-wrap items-center gap-6">
          <span>© 2026 TransitNode</span>
          <a href="#" className="hover:text-slate-800">Sitemap</a>
          <a href="/terms-of-service" className="hover:text-slate-800">Terms of Use</a>
          <a href="/privacy-policy" className="hover:text-slate-800">Privacy and Data Protection Notice</a>
          <a href="#" className="hover:text-slate-800">Cookie Settings</a>
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex space-x-3 text-slate-500">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-[#187baa] transition-colors">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-[#187baa] transition-colors">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
              </svg>
            </a>
            <a href="https://x.com" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" className="hover:text-[#187baa] transition-colors">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="hover:text-[#187baa] transition-colors">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
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
