import React from 'react';
import { StarIcon, HalfStarIcon } from './Icons';

const TestimonialsSection = ({ testimonials }) => {
  return (
    <section id="testimonials" className="container mx-auto px-4 sm:px-6 py-20 lg:py-24 relative z-10 border-t border-slate-100 scroll-mt-24">
      <div className="text-center mb-12 sm:mb-16 space-y-2">
        <div className="font-['Inter'] font-semibold text-xs sm:text-[13px] tracking-wider uppercase mb-2" style={{ color: 'rgba(19, 107, 207, 1)' }}>
          WALL OF TRUST
        </div>
        <h2 className="font-['Inter'] font-extrabold text-[24px] sm:text-[35px] leading-none text-center uppercase" style={{ color: 'rgba(0, 0, 0, 1)' }}>
          TESTIMONIALS
        </h2>
        <p className="text-xs text-slate-400 md:hidden font-medium">Swipe testimonials horizontally →</p>
      </div>

      {/* Mobile Horizontal Carousel Marquee / Desktop 3-Column Grid */}
      <div className="flex md:grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8 max-w-6xl mx-auto overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-6 md:pb-0 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
        {testimonials.map((t, idx) => (
          <div key={idx} className="flex-shrink-0 w-[85%] sm:w-[320px] md:w-auto snap-center bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              {/* Dynamic Star Rating */}
              <div className="flex items-center space-x-1 mb-4 sm:mb-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} className={`w-4 h-4 ${i < (t.rating || 5) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>

              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6 sm:mb-8 font-normal">
                "{t.quote}"
              </p>
            </div>

            <div className="flex items-center space-x-3.5 sm:space-x-4 pt-4 border-t border-slate-100">
              <img 
                src={t.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'} 
                alt={t.name} 
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-slate-200" 
              />
              <div>
                <div className="font-bold text-slate-900 text-xs">{t.name}</div>
                <div className="text-slate-500 text-[11px] font-medium">{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TestimonialsSection;
