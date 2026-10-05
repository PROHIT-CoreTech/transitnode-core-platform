import React, { useState, useEffect, useMemo, useRef } from 'react';

const TestimonialsSection = ({ testimonials = [], isLoading = false }) => {
  const [cardsPerView, setCardsPerView] = useState(3);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // 1. Sort by creation date DESC & Limit to latest 10 reviews
  const sortedTestimonials = useMemo(() => {
    if (!Array.isArray(testimonials)) return [];
    return [...testimonials]
      .sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : (a.timestamp ? new Date(a.timestamp).getTime() : 0);
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : (b.timestamp ? new Date(b.timestamp).getTime() : 0);
        return timeB - timeA;
      })
      .slice(0, 10);
  }, [testimonials]);

  const totalItems = sortedTestimonials.length;

  // Responsive Breakpoint Handler: Desktop (>=1024): 3, Tablet (768-1023): 2, Mobile (<768): 1
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1024) {
        setCardsPerView(3);
      } else if (width >= 768) {
        setCardsPerView(2);
      } else {
        setCardsPerView(1);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, totalItems - cardsPerView);

  // Reset activeIndex if out of bounds on resize or data update
  useEffect(() => {
    if (activeIndex > maxIndex) {
      setActiveIndex(maxIndex);
    }
  }, [cardsPerView, maxIndex, activeIndex]);

  // 3. Auto-play functionality with hover pause
  useEffect(() => {
    if (isLoading || totalItems <= cardsPerView || isHovered) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 4500);

    return () => clearInterval(interval);
  }, [isLoading, totalItems, cardsPerView, maxIndex, isHovered]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  // Touch Swipe Handlers for mobile & tablet
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 40;
    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
      handlePrev();
    }
  };

  // Slide shift transform calculation
  const getTranslateX = () => {
    if (totalItems <= cardsPerView) return 0;
    return activeIndex * (100 / cardsPerView);
  };

  return (
    <section id="testimonials" className="container mx-auto px-4 sm:px-6 py-20 lg:py-24 relative z-10 border-t border-slate-100 scroll-mt-24">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 sm:mb-14 gap-4 max-w-6xl mx-auto">
        <div className="space-y-2 text-center sm:text-left">
          <div className="font-['Inter'] font-semibold text-xs sm:text-[13px] tracking-wider uppercase mb-1" style={{ color: 'rgba(19, 107, 207, 1)' }}>
            WALL OF TRUST
          </div>
          <h2 className="font-['Inter'] font-extrabold text-[24px] sm:text-[35px] leading-none uppercase text-slate-900">
            TESTIMONIALS
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            See how fleet operators transform their daily operations with TransitNode.
          </p>
        </div>

        {/* Carousel Arrow Controls */}
        {!isLoading && totalItems > cardsPerView && (
          <div className="flex items-center justify-center sm:justify-end space-x-2 flex-shrink-0">
            <button
              onClick={handlePrev}
              aria-label="Previous testimonials"
              className="w-10 h-10 rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-200 flex items-center justify-center shadow-sm active:scale-95 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={handleNext}
              aria-label="Next testimonials"
              className="w-10 h-10 rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-200 flex items-center justify-center shadow-sm active:scale-95 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Main Slider Container */}
      <div className="max-w-6xl mx-auto overflow-hidden px-1 py-1">
        {isLoading ? (
          /* 5. Loading Skeleton State */
          <div className="flex -mx-3">
            {Array.from({ length: cardsPerView }).map((_, i) => (
              <div key={i} className="w-full md:w-1/2 lg:w-1/3 flex-shrink-0 px-3">
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-sm animate-pulse h-[260px] flex flex-col justify-between">
                  <div>
                    <div className="flex space-x-1.5 mb-5">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <div key={s} className="w-4 h-4 bg-slate-200 rounded" />
                      ))}
                    </div>
                    <div className="space-y-2.5 mb-6">
                      <div className="h-3.5 bg-slate-200 rounded w-full" />
                      <div className="h-3.5 bg-slate-200 rounded w-11/12" />
                      <div className="h-3.5 bg-slate-200 rounded w-4/5" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-3.5 pt-4 border-t border-slate-100">
                    <div className="w-10 h-10 bg-slate-200 rounded-full flex-shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3 bg-slate-200 rounded w-24" />
                      <div className="h-2.5 bg-slate-200 rounded w-36" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : totalItems === 0 ? (
          /* 5. Empty State */
          <div className="text-center py-12 bg-slate-50 border border-slate-200/60 rounded-2xl">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 text-lg">
              💬
            </div>
            <h3 className="text-sm font-semibold text-slate-800">No reviews featured yet</h3>
            <p className="text-xs text-slate-500 mt-1">Approved client reviews will appear here.</p>
          </div>
        ) : (
          /* 2 & 4. Interactive Carousel Track */
          <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="relative"
          >
            <div
              className={`flex -mx-3 transition-transform duration-500 ease-out ${
                totalItems <= cardsPerView ? 'justify-center' : ''
              }`}
              style={{
                transform: `translateX(-${getTranslateX()}%)`
              }}
            >
              {sortedTestimonials.map((t, idx) => (
                <div
                  key={t._id || idx}
                  className="w-full md:w-1/2 lg:w-1/3 flex-shrink-0 px-3 flex"
                >
                  <div className="w-full bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
                    <div>
                      {/* Dynamic Star Rating */}
                      <div className="flex items-center space-x-1 mb-4 sm:mb-5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${
                              i < (t.rating || 5)
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-200 fill-slate-200'
                            }`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>

                      {/* Quote Text with Uniform Min-Height */}
                      <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6 font-normal min-h-[100px] sm:min-h-[110px] flex-1">
                        "{t.quote}"
                      </p>
                    </div>

                    {/* Author Metadata Footer */}
                    <div className="flex items-center space-x-3.5 sm:space-x-4 pt-4 border-t border-slate-100 mt-auto">
                      <img
                        src={
                          t.avatar ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                        }
                        alt={t.name}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-slate-200 flex-shrink-0"
                      />
                      <div className="overflow-hidden">
                        <div className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                          {t.name}
                        </div>
                        <div className="text-slate-500 text-[11px] font-medium truncate">
                          {t.role}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Pagination Dots Indicator */}
        {!isLoading && totalItems > cardsPerView && (
          <div className="flex items-center justify-center space-x-2 mt-8">
            {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                aria-label={`Go to testimonial slide ${idx + 1}`}
                className={`h-2.5 transition-all duration-300 rounded-full cursor-pointer ${
                  idx === activeIndex
                    ? 'w-8 bg-blue-600 shadow-sm'
                    : 'w-2.5 bg-slate-300 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TestimonialsSection;
