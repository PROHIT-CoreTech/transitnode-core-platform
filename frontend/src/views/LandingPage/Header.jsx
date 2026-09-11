import React, { useState } from 'react';
import brandLogo from '../../assets/brand_logo.png';

const Header = ({ openRegisterModal }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm w-full px-3 sm:px-8 lg:px-12 py-2.5">
      <nav className="container mx-auto flex justify-between items-center max-w-7xl">
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-2 cursor-pointer flex-shrink-0" onClick={() => window.location.href = '/'}>
          <img src={brandLogo} alt="TransitNode Logo" className="h-6 sm:h-8 w-auto object-contain flex-shrink-0" />
          <span className="text-base sm:text-xl font-extrabold tracking-tight text-slate-900 whitespace-nowrap">
            Transit<span className="text-[#187baa]">Node</span>
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
          <a href="#why-us" className="hover:text-[#187baa] transition-colors">Why Us?</a>
          <a href="#about" className="hover:text-[#187baa] transition-colors">About Us</a>
          <a href="#contact" className="hover:text-[#187baa] transition-colors">Contact Us</a>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
          <a href="/login" className="hidden sm:inline-block text-xs sm:text-sm font-semibold text-slate-700 hover:text-[#187baa] transition-colors whitespace-nowrap">
            Log In
          </a>
          
          <button 
            onClick={() => openRegisterModal('free')}
            className="bg-[#187baa] hover:bg-[#14668f] text-white font-semibold text-xs sm:text-sm px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center space-x-1 whitespace-nowrap flex-shrink-0"
          >
            <span className="hidden sm:inline">Start Free Trial</span>
            <span className="sm:hidden">Free Trial</span>
            <span>→</span>
          </button>

          {/* Mobile Hamburger Menu Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="md:hidden text-slate-700 hover:text-slate-900 p-1.5 focus:outline-none flex-shrink-0"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-5 mt-2 space-y-3 font-medium text-sm text-slate-700 shadow-lg animate-fadeIn">
          <a 
            href="#why-us" 
            onClick={() => setMobileMenuOpen(false)} 
            className="block py-2 border-b border-slate-100 hover:text-[#187baa]"
          >
            Why Us?
          </a>
          <a 
            href="#about" 
            onClick={() => setMobileMenuOpen(false)} 
            className="block py-2 border-b border-slate-100 hover:text-[#187baa]"
          >
            About Us
          </a>
          <a 
            href="#contact" 
            onClick={() => setMobileMenuOpen(false)} 
            className="block py-2 hover:text-[#187baa]"
          >
            Contact Us
          </a>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <a href="/login" className="text-xs font-semibold text-slate-700 hover:text-[#187baa]">Log In to Account</a>
            <button 
              onClick={() => { setMobileMenuOpen(false); openRegisterModal('free'); }}
              className="text-xs font-bold text-[#187baa] hover:underline"
            >
              Start Free Trial →
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
