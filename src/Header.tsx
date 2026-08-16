import React, { useState, useEffect } from 'react';
import { CalendarCheck, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SiteContent } from './types';
import { defaultContent } from './defaultContent';

interface HeaderProps {
  isDetail?: boolean;
  onNavigateHome?: () => void;
  content?: SiteContent;
}

export default function Header({ isDetail = false, onNavigateHome, content }: HeaderProps) {
  const activeContent = content || defaultContent;
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMenuOpen]);

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsMenuOpen(false);
    if (onNavigateHome) onNavigateHome();
  };

  return (
    <>
      <div className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled ? 'bg-[#FDF7EF]/95 backdrop-blur-sm shadow-sm border-b border-[#EAE4D9]/50 py-1' : 'bg-transparent py-4 lg:py-5'
      }`}>
        <nav className={`flex items-center justify-between px-6 lg:px-12 max-w-[1800px] mx-auto w-full transition-all duration-300 ${
          isScrolled ? 'py-3' : 'py-0'
        }`}>
          <div className="flex-1 flex justify-start hidden md:flex">
            <ul className="flex items-center gap-2 lg:gap-6 font-medium text-sm lg:text-base">
              <li>
                <a href="#" onClick={handleHomeClick} className={!isDetail ? "bg-[#6A665A] text-white px-5 py-2 rounded-full transition hover:bg-[#5C584E]" : "px-3 hover:text-[#6A665A] transition"}>Home</a>
              </li>
              <li>
                <button 
                  onClick={() => document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' })} 
                  className="px-4 py-2 hover:bg-black/5 active:scale-95 active:bg-black/10 rounded-full transition-all duration-200 cursor-pointer"
                >
                  About
                </button>
              </li>
              <li>
                <button 
                  onClick={() => document.getElementById('themes-section')?.scrollIntoView({ behavior: 'smooth' })} 
                  className="px-4 py-2 hover:bg-black/5 active:scale-95 active:bg-black/10 rounded-full transition-all duration-200 cursor-pointer"
                >
                  Themes
                </button>
              </li>
              <li>
                <button 
                  onClick={() => document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' })} 
                  className="px-4 py-2 hover:bg-black/5 active:scale-95 active:bg-black/10 rounded-full transition-all duration-200 cursor-pointer"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center justify-center cursor-pointer" onClick={handleHomeClick}>
            <img src={activeContent.header.logo} alt="MaazXevents Logo" className="h-10 lg:h-12 w-auto" />
          </div>

          <div className="flex-1 flex justify-end">
            <button 
              onClick={() => window.open(activeContent.header.bookAppointmentUrl, '_blank')}
              className="hidden sm:flex items-center gap-2 bg-[#6A665A] hover:bg-[#5C584E] transition text-white px-5 lg:px-6 py-2.5 rounded-full font-medium text-sm lg:text-base shadow-sm"
            >
              <CalendarCheck size={18} />
              <span>Book Appointment</span>
            </button>
            <button 
              className="sm:hidden flex items-center justify-center w-[46px] h-[46px] rounded-[14px] bg-white border border-[#EAE4D9] text-[#4D4943] hover:bg-[#FDF7EF] transition-colors"
              onClick={() => setIsMenuOpen(true)}
            >
              <Menu size={20} strokeWidth={1.5} />
            </button>
          </div>
        </nav>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-[60] sm:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ type: "tween", ease: [0.16, 1, 0.3, 1], duration: 0.25 }}
              className="fixed top-0 left-0 right-0 h-auto max-h-[90vh] bg-[#FDF7EF] z-[70] sm:hidden rounded-b-[30px] overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-[#EAE4D9]">
                <img src={activeContent.header.logo} alt="MaazXevents Logo" className="h-8 w-auto" />
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="w-[46px] h-[46px] rounded-[14px] bg-white border border-[#EAE4D9] flex items-center justify-center text-[#4D4943] hover:bg-[#F1EFEC] transition-colors"
                >
                  <X size={20} strokeWidth={1.5} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-6 pb-8">
                <ul className="flex flex-col gap-4 text-xl font-serif text-[#2C2A26]">
                  <li>
                    <a 
                      href="#" 
                      onClick={handleHomeClick} 
                      className="block px-4 py-2 hover:bg-black/5 active:scale-95 active:bg-black/10 rounded-xl transition-all duration-200 hover:text-[#6A665A]"
                    >
                      Home
                    </a>
                  </li>
                  <li>
                    <button 
                      onClick={() => {
                        setIsMenuOpen(false);
                        document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-black/5 active:scale-95 active:bg-black/10 rounded-xl transition-all duration-200 hover:text-[#6A665A] font-serif"
                    >
                      About
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => {
                        setIsMenuOpen(false);
                        document.getElementById('themes-section')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-black/5 active:scale-95 active:bg-black/10 rounded-xl transition-all duration-200 hover:text-[#6A665A] font-serif"
                    >
                      Themes
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => {
                        setIsMenuOpen(false);
                        document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-black/5 active:scale-95 active:bg-black/10 rounded-xl transition-all duration-200 hover:text-[#6A665A] font-serif"
                    >
                      Contact
                    </button>
                  </li>
                </ul>
                <div className="mt-6 pt-5 border-t border-[#EAE4D9]">
                  <button 
                    onClick={() => window.open(activeContent.header.bookAppointmentUrl, '_blank')}
                    className="w-full flex items-center justify-center gap-2 bg-[#6A665A] hover:bg-[#5C584E] transition text-white px-5 py-3 rounded-xl font-medium text-base shadow-sm active:scale-[0.98]"
                  >
                    <CalendarCheck size={18} />
                    <span>Book Appointment</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
