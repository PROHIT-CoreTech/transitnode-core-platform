import React from 'react';
import brandLogo from '../../assets/brand_logo.png';

const Header = ({ openRegisterModal }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm w-full px-[34px] sm:px-[50px] lg:px-[66px] py-[10px]">
      <nav className="container mx-auto py-3.5 flex justify-between items-center">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.location.href = '/'}>
          <img src={brandLogo} alt="TransitNode Logo" className="h-8 w-auto object-contain" />
          <span className="text-xl font-extrabold tracking-tight text-slate-900">Transit<span className="text-[#187baa]">Node</span></span>
        </div>

        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
          <a href="#why-us" className="hover:text-[#187baa] transition-colors">Why Us?</a>
          <a href="#about" className="hover:text-[#187baa] transition-colors">About Us</a>
          <a href="#contact" className="hover:text-[#187baa] transition-colors">Contact Us</a>
        </div>

        <div className="flex items-center space-x-5">
          <a href="/login" className="text-sm font-semibold text-slate-700 hover:text-[#187baa] transition-colors">Log In</a>
          <button 
            onClick={() => openRegisterModal('free')}
            className="bg-[#187baa] hover:bg-[#14668f] text-white font-semibold text-sm px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
          >
            <span>Start Free Trial</span>
            <span>→</span>
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
