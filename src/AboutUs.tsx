import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { SiteContent } from './types';
import { defaultContent } from './defaultContent';

interface AboutUsProps {
  content?: SiteContent;
}

export default function AboutUs({ content }: AboutUsProps) {
  const activeContent = content || defaultContent;
  const { aboutUs } = activeContent;

  return (
    <section id="about-section" className="py-24 px-4 md:px-12 max-w-[1400px] mx-auto">
      <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
        {/* Left Image Side */}
        <div className="flex-1 relative w-full max-w-[500px] lg:max-w-none mx-auto">
          <div className="aspect-[4/5] rounded-[40px] overflow-hidden relative z-10 shadow-sm">
            <img 
              src={aboutUs.image1} 
              alt="Elegant table setting" 
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          
          {/* Overlapping secondary image */}
          <div className="absolute -bottom-10 -right-4 sm:-right-10 w-[60%] aspect-square rounded-[32px] overflow-hidden z-20 border-8 border-[#FDF7EF] shadow-lg hidden sm:block">
            <img 
              src={aboutUs.image2} 
              alt="Wedding details" 
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          {/* Decorative blur backdrop */}
          <div className="absolute top-1/4 -left-8 w-48 h-48 bg-[#D3D0C2] rounded-full blur-[80px] -z-10 opacity-60"></div>
        </div>

        {/* Right Text Side */}
        <div className="flex-1 flex flex-col items-start">
          <div className="bg-[#EBE7DF] rounded-full px-4 py-1.5 flex items-center gap-2 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-[#6A665A]"></div>
            <span className="text-[11px] font-bold text-[#6A665A] tracking-wider uppercase">{aboutUs.sectionTag}</span>
          </div>
          
          <h2 className="font-hedvig text-4xl md:text-5xl lg:text-[56px] text-[#2C2A26] leading-[1.1] mb-6">
            {aboutUs.title}
          </h2>
          
          <p className="text-[#6A665A] text-base md:text-[17px] leading-relaxed mb-6 font-medium">
            {aboutUs.desc1}
          </p>
          
          <p className="text-[#6A665A] text-base md:text-[17px] leading-relaxed mb-10 font-medium">
            {aboutUs.desc2}
          </p>
          
          <div className="grid grid-cols-2 gap-8 mb-10 w-full border-t border-[#EAE4D9] pt-8">
            {aboutUs.stats.map((stat, idx) => (
              <div key={idx}>
                <h4 className="font-hedvig text-4xl text-[#2C2A26] mb-1">{stat.value}</h4>
                <p className="text-[#8A867A] text-sm font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
          
          <button 
            onClick={() => window.open(activeContent.header.bookAppointmentUrl, '_blank')}
            className="flex items-center justify-center gap-2 bg-[#6A665A] hover:bg-[#5C584E] transition text-white px-8 py-4 rounded-full font-medium text-base shadow-sm w-full sm:w-auto cursor-pointer"
          >
            <span>{aboutUs.ctaText}</span>
            <ArrowUpRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
