import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { ThemeItem, SiteContent } from './types';
import { defaultContent } from './defaultContent';

interface ThemesSectionProps {
  onSelectItem: (item: ThemeItem) => void;
  content?: SiteContent;
}

export default function ThemesSection({ onSelectItem, content }: ThemesSectionProps) {
  const activeContent = content || defaultContent;
  const { themesSection } = activeContent;

  const [activeCategory, setActiveCategory] = useState(themesSection.categories[0] || "Wedding");
  const [activeSubcategory, setActiveSubcategory] = useState(
    (themesSection.subcategories[themesSection.categories[0] || "Wedding"]?.[0]) || "Bridal Shower"
  );
  const [visibleCount, setVisibleCount] = useState(4);
  const constraintsRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [dragBounds, setDragBounds] = useState({ left: 0, right: 0 });

  // Update states if content/categories change
  useEffect(() => {
    if (themesSection.categories.length > 0) {
      const firstCat = themesSection.categories[0];
      setActiveCategory(firstCat);
      setActiveSubcategory(themesSection.subcategories[firstCat]?.[0] || "");
    }
  }, [content]);

  useEffect(() => {
    const updateBounds = () => {
      if (constraintsRef.current && carouselRef.current) {
        const parentWidth = constraintsRef.current.offsetWidth;
        const childWidth = carouselRef.current.scrollWidth;
        const newLeft = childWidth > parentWidth ? parentWidth - childWidth : 0;
        
        setDragBounds(prev => {
          if (prev.left !== newLeft || prev.right !== 0) {
            return { left: newLeft, right: 0 };
          }
          return prev;
        });
      }
    };
    
    updateBounds();
    
    const resizeObserver = new ResizeObserver(() => {
      updateBounds();
    });

    if (constraintsRef.current) {
      resizeObserver.observe(constraintsRef.current);
    }
    if (carouselRef.current) {
      resizeObserver.observe(carouselRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [activeCategory, content]);

  const categories = themesSection.categories;
  const subcategories = themesSection.subcategories;
  const items = themesSection.items;

  const activeSubs = subcategories[activeCategory] || [];

  return (
    <section id="themes-section" className="w-full max-w-6xl mx-auto mt-24 md:mt-48 px-4 pb-32">
      {/* Header */}
      <div className="flex flex-col items-center mb-10 md:mb-16">
        <div className="bg-[#EAE4D9] text-[#6A665A] text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 mb-6 tracking-widest uppercase">
          <div className="w-1.5 h-1.5 bg-[#6A665A] rounded-full"></div>
          THEMES
        </div>
        <h2 className="text-4xl md:text-[52px] font-serif text-[#4D4943] text-center leading-[1.15] tracking-tight">
          EXPLORE<br />OUR EVENT STYLES
        </h2>
      </div>

      {/* Main Categories Tab Bar */}
      <div className="bg-[#F2ECE4] rounded-[2rem] md:rounded-full p-2 flex flex-wrap md:flex-nowrap gap-2 mb-8 md:mb-10 justify-center mx-auto max-w-4xl shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]">
        {categories.map(c => (
          <button
            key={c}
            onClick={() => { 
              setActiveCategory(c); 
              setActiveSubcategory(subcategories[c]?.[0] || ""); 
              setVisibleCount(4); 
            }}
            className={`flex-1 py-3 md:py-3.5 px-4 md:px-6 rounded-full text-[14px] md:text-[15px] font-medium transition-all min-w-[140px] whitespace-nowrap cursor-pointer ${
              activeCategory === c 
                ? 'bg-[#6A665A] text-white shadow-md' 
                : 'bg-white text-[#4D4943] hover:bg-white/70 shadow-sm'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Subcategories */}
      {activeSubs.length > 0 && (
        <div className="mb-10 md:mb-12 max-w-5xl mx-auto relative overflow-hidden flex flex-col items-start w-full" ref={constraintsRef}>
          <p className="text-[#8B867B] text-[11px] font-medium mb-3 uppercase tracking-wide text-left w-full">SUBCATEGORIES</p>
          <motion.div 
            ref={carouselRef}
            className="flex gap-2.5 pb-2 cursor-grab active:cursor-grabbing w-max justify-start"
            drag="x"
            dragConstraints={dragBounds}
            dragElastic={0.15}
            dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
          >
            {activeSubs.map((s) => (
              <motion.button
                key={s}
                onClick={() => { setActiveSubcategory(s); setVisibleCount(4); }}
                className={`flex-none px-4 py-2 md:py-1.5 rounded-full text-[13px] md:text-sm font-medium transition-colors whitespace-nowrap border cursor-pointer ${
                  activeSubcategory === s 
                    ? 'bg-[#8B867B] text-white border-[#8B867B] shadow-sm' 
                    : 'bg-transparent text-[#6A665A] border-[#D1CCC3] hover:bg-[#F2ECE4]'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                {s}
              </motion.button>
            ))}
          </motion.div>
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
        {items
          .filter(item => item.category === activeSubcategory)
          .slice(0, visibleCount)
          .map(item => (
          <div 
            key={item.id} 
            onClick={() => onSelectItem(item)}
            className="group bg-white rounded-[32px] p-3 border border-[#EAE4D9] flex flex-col cursor-pointer transition-colors hover:border-[#D1CCC3]"
          >
            <div className="w-full h-[300px] md:h-[400px] rounded-[24px] overflow-hidden mb-6 relative bg-[#2c2a26]/5">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
            </div>
            <div className="px-4 pb-4 text-left">
              <h3 className="font-serif text-2xl md:text-3xl text-[#4D4943] mb-2 group-hover:text-[#6A665A] transition-colors">{item.title}</h3>
              <div className="flex items-center justify-between min-h-[30px]">
                <div className="flex items-center gap-2 md:gap-3">
                  <p className="text-[#6A665A] text-[20px] md:text-[22px] font-semibold whitespace-nowrap tracking-tight">{item.actualPrice}</p>
                  <p className="text-[#B5B0A6] line-through text-[14px] md:text-[15px] font-medium whitespace-nowrap">{item.price}</p>
                </div>
                <div className="flex items-center gap-[7px] md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 transform md:translate-x-4 md:group-hover:translate-x-0">
                  <span className="text-[#57554C] font-medium text-[15px] md:text-[17px] hidden sm:block">
                    View details
                  </span>
                  <div className="flex justify-center items-center rounded-full bg-[#676452] w-[32px] h-[32px] md:w-[34px] md:h-[34px] shrink-0 shadow-sm transition-transform group-hover:scale-105">
                    <ArrowUpRight className="text-white w-[18px] h-[18px]" strokeWidth={2} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {items.filter(item => item.category === activeSubcategory).length > visibleCount && (
        <div className="flex justify-center mt-10 md:mt-12">
          <button
            onClick={() => setVisibleCount(prev => prev + 4)}
            className="bg-transparent border border-[#6A665A] text-[#6A665A] hover:bg-[#6A665A] hover:text-white px-8 py-3 rounded-full font-medium transition-colors cursor-pointer"
          >
            Load More
          </button>
        </div>
      )}
    </section>
  );
}
