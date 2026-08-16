import React, { useRef } from 'react';
import { Star } from 'lucide-react';
import { SiteContent } from './types';
import { defaultContent } from './defaultContent';

interface WhyChooseUsProps {
  content?: SiteContent;
}

export default function WhyChooseUs({ content }: WhyChooseUsProps) {
  const activeContent = content || defaultContent;
  const { whyChooseUs } = activeContent;

  const isDraggingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const beforeImgRef = useRef<HTMLImageElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const beforeTagRef = useRef<HTMLDivElement>(null);
  const afterTagRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  const updateDOM = (percentage: number) => {
    if (beforeImgRef.current) beforeImgRef.current.style.clipPath = `inset(0 ${100 - percentage}% 0 0)`;
    if (lineRef.current) lineRef.current.style.left = `${percentage}%`;
    if (iconRef.current) iconRef.current.style.left = `${percentage}%`;
    if (beforeTagRef.current) beforeTagRef.current.style.opacity = percentage < 15 ? '0' : '1';
    if (afterTagRef.current) afterTagRef.current.style.opacity = percentage > 85 ? '0' : '1';
  };

  const handleMove = (clientX: number) => {
    if (!isDraggingRef.current) return;
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      requestAnimationFrame(() => updateDOM(percentage));
    }
  };

  const onMouseMove = (e: React.MouseEvent) => handleMove(e.clientX);
  const onTouchMove = (e: React.TouchEvent) => handleMove(e.touches[0].clientX);

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    requestAnimationFrame(() => updateDOM(50));
  };

  return (
    <section className="py-24 px-4 md:px-12 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-16">
        <div className="bg-[#EBE7DF] rounded-full px-4 py-1.5 flex items-center gap-2 mb-6">
          <div className="w-1.5 h-1.5 rounded-full bg-[#6A665A]"></div>
          <span className="text-[11px] font-bold text-[#6A665A] tracking-wider uppercase">{whyChooseUs.sectionTag}</span>
        </div>
        <h2 className="font-hedvig text-4xl md:text-5xl lg:text-[56px] text-[#2C2A26] max-w-3xl leading-[1.1]">
          {whyChooseUs.title.split('\n').map((line, idx) => (
            <React.Fragment key={idx}>
              {line}
              {idx < whyChooseUs.title.split('\n').length - 1 && <br />}
            </React.Fragment>
          ))}
        </h2>
      </div>

      {/* Grid */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Column 1 */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Vision to Reality (Interactive Slider) */}
          <div 
            ref={containerRef}
            className="relative h-[460px] rounded-[32px] overflow-hidden group shadow-sm cursor-ew-resize select-none"
            onMouseDown={(e) => {
              isDraggingRef.current = true;
              if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                const x = e.clientX - rect.left;
                requestAnimationFrame(() => updateDOM(Math.max(0, Math.min(100, (x / rect.width) * 100))));
              }
            }}
            onTouchStart={(e) => {
              isDraggingRef.current = true;
              if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                const x = e.touches[0].clientX - rect.left;
                requestAnimationFrame(() => updateDOM(Math.max(0, Math.min(100, (x / rect.width) * 100))));
              }
            }}
            onMouseMove={onMouseMove}
            onTouchMove={onTouchMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchEnd={handleMouseUp}
          >
            {/* Background Image (After) */}
            <img 
              src={whyChooseUs.afterImage} 
              alt="Event Setup Completed" 
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              draggable="false"
            />
            
            {/* Foreground Image (Before) */}
            <img 
              ref={beforeImgRef}
              src={whyChooseUs.beforeImage} 
              alt="Event Setup Empty" 
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              style={{ clipPath: `inset(0 50% 0 0)` }}
              draggable="false"
              loading="lazy"
            />

            {/* Split effect line */}
            <div 
              ref={lineRef}
              className="absolute inset-y-0 w-[2px] bg-white pointer-events-none shadow-[0_0_10px_rgba(0,0,0,0.3)]"
              style={{ left: `50%`, transform: 'translateX(-50%)' }}
            ></div>
            
            {/* Before / After Tags */}
            <div ref={beforeTagRef} className="absolute top-6 left-6 text-nowrap inline-flex py-[3px] px-[20px] justify-center items-center rounded-xl border border-[rgba(255,255,255,0.24)] bg-[rgba(255,255,255,0.48)] backdrop-blur-md pointer-events-none transition-opacity duration-300">
              <span className="text-[#000] text-[15px] font-medium leading-7 tracking-wide">Before</span>
            </div>
            <div ref={afterTagRef} className="absolute top-6 right-6 text-nowrap inline-flex py-[3px] px-[20px] justify-center items-center rounded-xl border border-[rgba(255,255,255,0.24)] bg-[rgba(255,255,255,0.48)] backdrop-blur-md pointer-events-none transition-opacity duration-300">
              <span className="text-[#000] text-[15px] font-medium leading-7 tracking-wide">After</span>
            </div>
            
            {/* Slider control icon */}
            <div 
              ref={iconRef}
              className="absolute top-1/2 -translate-y-1/2 w-[60px] h-[60px] bg-[rgba(255,255,255,0.48)] border border-[rgba(255,255,255,0.24)] backdrop-blur-md rounded-full flex items-center justify-center text-black pointer-events-none shadow-sm"
              style={{ left: `50%`, transform: 'translate(-50%, -50%)' }}
            >
              <div className="flex items-center gap-1">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </div>

            {/* Bottom Content */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-8 pt-24 pointer-events-none">
              <h3 className="text-white font-hedvig text-[28px] mb-2">{whyChooseUs.sliderTitle}</h3>
              <p className="text-white/80 text-[13px] font-medium tracking-wide">{whyChooseUs.sliderSub}</p>
            </div>
          </div>

          {/* Fast Booking */}
          <div className="bg-[#D3D0C2] rounded-[32px] h-[280px] flex flex-col items-center justify-center text-center p-8 shadow-sm">
            <h3 className="font-hedvig text-[32px] text-[#2C2A26] mb-4">{whyChooseUs.fastBookingTitle}</h3>
            <p className="text-[#5C584E] text-[15px] font-medium leading-relaxed max-w-[220px]">
              {whyChooseUs.fastBookingDesc}
            </p>
          </div>
        </div>

        {/* Column 2 */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Stress-Free Planning */}
          <div className="bg-[#D3D0C2] rounded-[32px] h-[240px] overflow-hidden flex flex-col relative pt-8 shadow-sm">
            <h3 className="font-hedvig text-[28px] text-[#2C2A26] text-center mb-6 relative z-10">{whyChooseUs.stressFreeTitle}</h3>
            <div className="flex-1 relative">
              <img 
                src={whyChooseUs.stressFreeImage} 
                alt="Handshake" 
                className="absolute -top-10 inset-x-0 w-full h-[calc(100%+40px)] object-cover object-top"
                loading="lazy"
              />
            </div>
          </div>

          {/* Tailored to your vision */}
          <div className="bg-white rounded-[32px] p-8 flex flex-col items-center justify-center text-center h-[280px] shadow-sm">
            <div className="flex items-center justify-center mb-7">
              {whyChooseUs.tailoredImages.map((img, idx) => (
                <img 
                  key={idx}
                  src={img} 
                  className={`rounded-full border-4 border-white object-cover ${
                    idx === 1 
                      ? 'w-[84px] h-[84px] z-20 -ml-4 shadow-md' 
                      : 'w-[68px] h-[68px] z-10 shadow-sm ' + (idx > 0 ? '-ml-4' : '')
                  }`} 
                  alt="Event detail" 
                  loading="lazy" 
                />
              ))}
            </div>
            <h3 className="font-hedvig text-[26px] text-[#2C2A26] mb-3">{whyChooseUs.tailoredTitle}</h3>
            <p className="text-[#6A665A] text-[14px] leading-[1.6] max-w-[260px] font-medium">
              {whyChooseUs.tailoredDesc}
            </p>
          </div>

          {/* Floral Arch */}
          <div className="rounded-[32px] overflow-hidden h-[196px] shadow-sm">
            <img 
              src={whyChooseUs.floralArchImage} 
              alt="Elegant Event Decor" 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              loading="lazy"
            />
          </div>
        </div>

        {/* Column 3 */}
        <div className="flex-1 flex flex-col gap-6">
          {/* 20+ Setups */}
          <div className="bg-[#D3D0C2] rounded-[32px] p-8 pt-10 relative overflow-hidden h-[240px] shadow-sm">
            <div className="relative z-10">
              <h3 className="font-hedvig text-[56px] text-[#2C2A26] leading-none mb-3">{whyChooseUs.setupsCountValue}</h3>
              <p className="text-[#5C584E] font-medium text-[15px] mb-6">{whyChooseUs.setupsCountSub}</p>
              <div className="inline-block bg-white text-[#4D4943] text-[11px] font-bold px-4 py-2 rounded-full shadow-sm">
                {whyChooseUs.setupsCountBadge}
              </div>
            </div>
            <div className="absolute -bottom-[22px] -right-2 font-hedvig text-[100px] text-[#C0BCAE] opacity-40 leading-none pointer-events-none select-none tracking-tighter whitespace-nowrap">
              {whyChooseUs.setupsCountBgText}
            </div>
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-[32px] p-8 shadow-sm flex-1 flex flex-col">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="flex gap-1 text-[#8C6D46] mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} fill="currentColor" strokeWidth={0} />
                ))}
              </div>
              <h3 className="font-hedvig text-[52px] text-[#2C2A26] leading-none mb-2">{whyChooseUs.reviewsRatingText}</h3>
              <p className="text-[#6A665A] text-[14px] font-medium">{whyChooseUs.reviewsSubText}</p>
            </div>

            <div className="flex-1 flex flex-col gap-6">
              {whyChooseUs.testimonials.map((t, idx) => {
                const isLast = idx === whyChooseUs.testimonials.length - 1;
                if (!t.quote) {
                  return (
                    <div key={idx} className="flex justify-between items-start border-b border-[#F1EFEC] pb-6">
                      <div>
                        <h4 className="font-semibold text-[#2C2A26] text-[14px]">{t.name}</h4>
                        <p className="text-[13px] text-[#8A867A]">{t.role}</p>
                      </div>
                      <img src={t.image} className="w-[42px] h-[42px] rounded-full object-cover border border-[#EAE4D9]" alt={t.name} loading="lazy" />
                    </div>
                  );
                }
                return (
                  <div key={idx} className={!isLast ? "border-b border-[#F1EFEC] pb-6" : ""}>
                    <div className="flex gap-0.5 text-[#8C6D46] mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={11} fill="currentColor" strokeWidth={0} />
                      ))}
                    </div>
                    <p className="text-[13px] text-[#6A665A] mb-4 font-medium leading-[1.6]">
                      {t.quote}
                    </p>
                    <div className="flex justify-between items-end">
                      <div>
                        <h4 className="font-semibold text-[#2C2A26] text-[14px]">{t.name}</h4>
                        <p className="text-[13px] text-[#8A867A]">{t.role}</p>
                      </div>
                      <img src={t.image} className="w-[42px] h-[42px] rounded-full object-cover border border-[#EAE4D9]" alt={t.name} loading="lazy" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
