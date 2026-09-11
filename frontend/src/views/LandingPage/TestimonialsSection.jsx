import React from 'react';
import { StarIcon, HalfStarIcon } from './Icons';

const TestimonialsSection = ({ testimonials }) => {
  return (
    <section id="testimonials" className="container mx-auto px-6 py-20 lg:py-24 relative z-10 border-t border-slate-100 scroll-mt-24">
      <div className="text-center mb-16">
        <h2 className="font-['Inter'] font-extrabold text-[28px] sm:text-[35px] leading-none text-center uppercase" style={{ color: 'rgba(0, 0, 0, 1)' }}>
          TESTIMONIALS
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {testimonials.map((t, idx) => (
          <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              {/* 4.5 Star Rating */}
              <div className="flex items-center space-x-1 mb-5">
                <StarIcon />
                <StarIcon />
                <StarIcon />
                <StarIcon />
                <HalfStarIcon />
              </div>

              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-8 font-normal">
                {t.quote}
              </p>
            </div>

            <div className="flex items-center space-x-4 pt-4 border-t border-slate-100">
              <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
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
