import React from 'react';
import { MapPin, Phone, Mail, Facebook, Instagram } from 'lucide-react';
import { SiteContent } from './types';
import { defaultContent } from './defaultContent';

interface FooterProps {
  content?: SiteContent;
}

export default function Footer({ content }: FooterProps) {
  const activeContent = content || defaultContent;
  const { footer } = activeContent;

  return (
    <footer id="contact-section" className="px-6 lg:px-12 pb-4 max-w-[1800px] mx-auto w-full mt-10 md:mt-20">
      <div className="bg-[#C5C6B6] rounded-[40px] p-10 lg:p-16 flex flex-col justify-between">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8">
          
          {/* Left Column */}
          <div className="md:col-span-5 lg:col-span-4 flex flex-col">
            <div className="flex items-center mb-6">
              <img src={footer.logo} alt="MaazXevents Logo" className="h-10 lg:h-12 w-auto opacity-90" />
            </div>
            <p className="text-[#57554C] leading-relaxed text-[15px] md:text-base pr-4">
              {footer.description}
            </p>
          </div>

          {/* Middle Column */}
          <div className="md:col-span-3 lg:col-span-2 lg:col-start-7 flex flex-col">
            <h3 className="font-serif text-[28px] text-[#4D4943] mb-6 leading-tight">Quick links</h3>
            <ul className="flex flex-col gap-4">
              <li><a href="#" className="text-[#57554C] hover:text-black transition-colors font-medium">Home</a></li>
              <li><button onClick={() => document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' })} className="text-left text-[#57554C] hover:text-black transition-colors font-medium cursor-pointer">About Us</button></li>
              <li><button onClick={() => document.getElementById('themes-section')?.scrollIntoView({ behavior: 'smooth' })} className="text-left text-[#57554C] hover:text-black transition-colors font-medium cursor-pointer">Service</button></li>
            </ul>
          </div>

          {/* Right Column */}
          <div className="md:col-span-4 lg:col-span-3 flex flex-col">
            <h3 className="font-serif text-[28px] text-[#4D4943] mb-6">Get in touch</h3>
            <ul className="flex flex-col gap-5">
              <li className="flex items-center gap-4 text-[#57554C]">
                <MapPin className="w-[22px] h-[22px] shrink-0" strokeWidth={1.5} />
                <span className="font-medium text-[15px]">{footer.location}</span>
              </li>
              <li className="flex items-center gap-4 text-[#57554C]">
                <Phone className="w-[22px] h-[22px] shrink-0" strokeWidth={1.5} />
                <span className="font-medium text-[15px]">{footer.phone}</span>
              </li>
              <li className="flex items-center gap-4 text-[#57554C]">
                <Mail className="w-[22px] h-[22px] shrink-0" strokeWidth={1.5} />
                <span className="font-medium text-[15px]">{footer.email}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mt-20 pt-6">
          <div className="flex items-center gap-4">
            <a href={footer.facebookUrl} className="w-[42px] h-[42px] rounded-xl bg-black/5 flex items-center justify-center text-[#4D4943] hover:bg-black/10 transition-colors">
              <Facebook className="w-[22px] h-[22px]" strokeWidth={1.5} />
            </a>
            <a href={footer.instagramUrl} className="w-[42px] h-[42px] rounded-xl bg-black/5 flex items-center justify-center text-[#4D4943] hover:bg-black/10 transition-colors">
              <Instagram className="w-[22px] h-[22px]" strokeWidth={1.5} />
            </a>
          </div>
          <p className="text-[#57554C] text-[15px] font-medium">
            {footer.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
