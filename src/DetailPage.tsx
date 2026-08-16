import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, CheckCircle2, ShieldCheck, Clock, CreditCard, RefreshCw, Share, Grid, Check, ArrowUpRight } from 'lucide-react';
import { ThemeItem } from './types';
import Footer from './Footer';
import Header from './Header';
import { mockItems } from './data';

interface DetailPageProps {
  item: ThemeItem;
  onBack: () => void;
  onSelectItem: (item: ThemeItem) => void;
}

export default function DetailPage({ item, onBack, onSelectItem }: DetailPageProps) {
  const [[page, direction], setPage] = useState([0, 0]);
  const constraintsRef = useRef<HTMLDivElement>(null);
  
  // Update state when item changes
  useEffect(() => {
    setPage([0, 0]);
    window.scrollTo(0, 0);
  }, [item]);

  const imageIndex = Math.abs(page % item.gallery.length);
  const activeImage = item.gallery[imageIndex];

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  const handleWhatsApp = () => {
    const message = `Hello! I am interested in booking the "${item.title}".\n\nDetails:\n- Price: ${item.actualPrice} (Original: ${item.price})\n\nPlease let me know about availability!`;
    const waUrl = `https://api.whatsapp.com/send/?phone=923252938365&text=${encodeURIComponent(message)}&type=phone_number&app_absent=0`;
    window.open(waUrl, '_blank');
  };

  const relatedItems = mockItems.filter(
    (relatedItem) => relatedItem.category === item.category && relatedItem.id !== item.id
  );

  return (
    <div className="min-h-screen bg-[#FDF7EF] text-[#5C584E] font-sans selection:bg-black selection:text-white">
      <Header isDetail={true} onNavigateHome={onBack} />
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 mt-8">
        
        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Gallery */}
          <div className="flex flex-col gap-4 min-w-0">
            <div className="relative w-full rounded-[24px] overflow-hidden bg-white shadow-sm aspect-[4/4.5] md:aspect-square lg:aspect-[4/5]">
              {/* Floating Back Button */}
              <button 
                onClick={onBack}
                className="absolute top-6 left-6 z-20 w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#4D4943] hover:bg-[#FDF7EF] transition-colors"
              >
                <ArrowLeft className="w-5 h-5" strokeWidth={2} />
              </button>

              <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.img
                  key={page}
                  src={activeImage}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover cursor-grab active:cursor-grabbing"
                  custom={direction}
                  initial={{ opacity: 0, x: direction > 0 ? 100 : -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction < 0 ? 100 : -100 }}
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 }
                  }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={1}
                  onDragEnd={(e, { offset, velocity }) => {
                    const swipeThreshold = 50; // Simple pixel threshold instead of complex velocity math

                    if (offset.x < -swipeThreshold) {
                      paginate(1);
                    } else if (offset.x > swipeThreshold) {
                      paginate(-1);
                    }
                  }}
                />
              </AnimatePresence>
            </div>
            
            {/* Thumbnails */}
            <div className="w-full relative overflow-hidden" ref={constraintsRef}>
              <motion.div 
                className="flex gap-3 py-2 cursor-grab active:cursor-grabbing w-max pr-4"
                drag="x"
                dragConstraints={constraintsRef}
                dragElastic={0.15}
                dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
              >
                {item.gallery.map((img, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => setPage([idx, idx > imageIndex ? 1 : -1])}
                    whileTap={{ scale: 0.95 }}
                    className={`relative shrink-0 w-[80px] h-[80px] md:w-[100px] md:h-[100px] rounded-[16px] overflow-hidden transition-all duration-300 ${
                      activeImage === img 
                        ? 'ring-2 ring-[#6A665A] ring-offset-2 ring-offset-[#FDF7EF]' 
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover pointer-events-none" />
                    {idx === 3 && item.gallery.length > 4 && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
                        <span className="text-white font-medium text-lg">+{item.gallery.length - 4}</span>
                      </div>
                    )}
                  </motion.button>
                ))}
              </motion.div>
            </div>
          </div>

          {/* Right Column: Details Section */}
          <div className="flex flex-col justify-start pt-2 lg:pt-0 pb-20 md:pb-0">
            {/* Top Right Actions - Desktop Only */}
            <div className="hidden md:flex justify-end gap-3 mb-6">
              <button className="w-[46px] h-[46px] rounded-[14px] bg-white border border-[#EAE4D9] flex items-center justify-center text-[#4D4943] hover:bg-[#FDF7EF] transition-colors">
                <Share className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            <span className="inline-flex items-center px-5 py-2 rounded-full bg-[#F1EFEC] text-[#57554C] text-[14px] font-medium w-max mb-6">
              {item.category}
            </span>
            
            <h1 className="font-serif text-[40px] md:text-[48px] text-[#2C2A26] mb-8 leading-tight">
              {item.title}
            </h1>
            
            {/* Price Box */}
            <div className="bg-[#F1EFEC] rounded-[20px] p-5 mb-8 flex items-center gap-4">
              <span className="text-[28px] md:text-[32px] font-medium text-black">{item.actualPrice}</span>
              <span className="text-[18px] text-[#A39E93] line-through">{item.price}</span>
            </div>

            <p className="text-[#57554C] text-[16px] leading-relaxed mb-10">
              {item.description}
            </p>

            {/* Attributes List */}
            <div className="flex flex-col gap-6 mb-10">
              {item.attributes.map((attr, idx) => {
                let Icon = CheckCircle2;
                if (attr.label.includes('Time')) Icon = Clock;
                if (attr.label.includes('Space')) Icon = Grid;
                
                return (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 border-b border-[#EAE4D9] pb-6 last:border-0 last:pb-0">
                    <div className="flex items-center w-full sm:w-[220px] shrink-0 text-[#2C2A26] font-semibold text-[15px]">
                      <Icon className="w-[20px] h-[20px] mr-4 text-[#6A665A] shrink-0" strokeWidth={1.5} />
                      {attr.label}
                    </div>
                    <span className="text-[#6A665A] text-[15px]">{attr.value}</span>
                  </div>
                );
              })}
            </div>

            {/* Desktop WhatsApp Button */}
            <button
              onClick={handleWhatsApp}
              className="hidden md:flex w-full bg-[#5D724D] text-white px-8 py-5 rounded-[16px] font-medium text-[17px] hover:bg-[#4D6A46] transition-colors shadow-sm items-center justify-center gap-3 mb-8"
            >
              <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
              </svg>
              Book on WhatsApp
            </button>

            {/* Bottom Features Container */}
            <div className="bg-[#F1EFEC] rounded-[20px] p-6 grid grid-cols-4 gap-2 md:gap-4 divide-x divide-[#D1CCC3]">
              <div className="flex flex-col items-center justify-center text-center px-1 md:px-2">
                <ShieldCheck className="w-[20px] h-[20px] text-[#2C2A26] mb-2" strokeWidth={1.5} />
                <span className="text-[#57554C] text-[10px] md:text-[12px] font-semibold leading-tight">Premium Decor</span>
              </div>
              
              <div className="flex flex-col items-center justify-center text-center px-1 md:px-2">
                <Clock className="w-[20px] h-[20px] text-[#2C2A26] mb-2" strokeWidth={1.5} />
                <span className="text-[#57554C] text-[10px] md:text-[12px] font-semibold leading-tight">On-Time Setup</span>
              </div>
              
              <div className="flex flex-col items-center justify-center text-center px-1 md:px-2">
                <CreditCard className="w-[20px] h-[20px] text-[#2C2A26] mb-2" strokeWidth={1.5} />
                <span className="text-[#57554C] text-[10px] md:text-[12px] font-semibold leading-tight">Secure Booking</span>
              </div>
              
              <div className="flex flex-col items-center justify-center text-center px-1 md:px-2">
                <RefreshCw className="w-[20px] h-[20px] text-[#2C2A26] mb-2" strokeWidth={1.5} />
                <span className="text-[#57554C] text-[10px] md:text-[12px] font-semibold leading-tight">Flexible Changes</span>
              </div>
            </div>

          </div>
        </div>

        {/* Related Designs Section */}
        {relatedItems.length > 0 && (
          <div className="mt-24 lg:mt-32 mb-16">
            <div className="flex items-end justify-between mb-10 w-full border-b border-[#EAE4D9] pb-6">
              <div>
                <span className="uppercase tracking-widest text-xs font-semibold text-[#8C877D] block mb-2">Explore</span>
                <h2 className="font-serif text-3xl md:text-4xl text-[#2C2A26]">More from this collection</h2>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 w-full">
              {relatedItems.map(related => (
                <div 
                  key={related.id} 
                  onClick={() => onSelectItem(related)}
                  className="group cursor-pointer flex flex-col"
                >
                  <div className="w-full aspect-[4/5] rounded-[24px] overflow-hidden mb-5 relative bg-[#EAE4D9]">
                    <img 
                      src={related.image} 
                      alt={related.title} 
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                    
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <div className="flex items-center gap-1.5 text-[#2C2A26]">
                        <span className="text-xs font-medium uppercase tracking-wide">View</span>
                        <ArrowUpRight size={14} strokeWidth={2.5} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-1 flex flex-col gap-1">
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="font-serif text-xl md:text-2xl text-[#2C2A26] group-hover:text-[#6A665A] transition-colors">{related.title}</h3>
                      <div className="text-right shrink-0">
                        <p className="text-[#2C2A26] font-medium text-lg">{related.actualPrice}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-[#8C877D] text-sm uppercase tracking-wider">{related.category}</p>
                      <p className="text-[#B5B0A6] line-through text-sm">{related.price}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
      <Footer />

      {/* Mobile Fixed Bottom Bar */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-50 bg-[#FDF7EF] border-t border-[#EAE4D9] p-4 flex gap-3 md:hidden"
        style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
      >
        <button className="w-[50px] h-[50px] shrink-0 rounded-[14px] bg-white border border-[#EAE4D9] flex items-center justify-center text-[#4D4943] hover:bg-[#FDF7EF] transition-colors shadow-sm">
          <Share className="w-5 h-5" strokeWidth={1.5} />
        </button>
        <button
          onClick={handleWhatsApp}
          className="flex-1 bg-[#5D724D] text-white h-[50px] rounded-[14px] font-medium text-[16px] hover:bg-[#4D6A46] transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          <svg className="w-[20px] h-[20px]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
          </svg>
          Book on WhatsApp
        </button>
      </div>
    </div>
  );
}
