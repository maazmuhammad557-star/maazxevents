import React, { useState, useEffect } from 'react';
import { ThemeItem, SiteContent } from './types';
import { defaultContent } from './defaultContent';
import Header from './Header';
import ThemesSection from './ThemesSection';
import AdminPanel from './AdminPanel';

const DetailPage = React.lazy(() => import('./DetailPage'));
const Footer = React.lazy(() => import('./Footer'));
const WhyChooseUs = React.lazy(() => import('./WhyChooseUs'));
const AboutUs = React.lazy(() => import('./AboutUs'));

export default function App() {
  const [path, setPath] = useState(window.location.pathname);
  const [content, setContent] = useState<SiteContent | null>(null);
  const [selectedItem, setSelectedItem] = useState<ThemeItem | null>(null);

  useEffect(() => {
    const handleCmsUpdate = (e: Event) => {
      setContent((e as CustomEvent).detail);
    };
    window.addEventListener('cms-content-updated', handleCmsUpdate);

    const fetchContent = async () => {
      try {
        const res = await fetch(`/api/get-content?t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          // If the redirect returned valid json
          if (data && data.header) {
            setContent(data);
          } else {
            setContent(defaultContent);
          }
        } else {
          setContent(defaultContent);
        }
      } catch (err) {
        setContent(defaultContent);
      }
    };
    fetchContent();

    const handlePopState = () => {
      setPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('cms-content-updated', handleCmsUpdate);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const navigate = (newPath: string) => {
    window.history.pushState({}, '', newPath);
    setPath(newPath);
  };

  // While content is loading, show a premium loading screen
  if (!content) {
    return (
      <div className="min-h-screen bg-[#FDF7EF] flex flex-col items-center justify-center gap-4">
        <img src="/logo.png" alt="MaazXevents Logo" className="h-14 w-auto animate-pulse" />
        <div className="w-16 h-1 bg-[#EAE4D9] rounded-full overflow-hidden">
          <div className="w-1/2 h-full bg-[#6A665A] rounded-full animate-infinite-loading"></div>
        </div>
      </div>
    );
  }

  // Routing Condition
  if (path === '/admin') {
    return <AdminPanel onBackToSite={() => navigate('/')} initialContent={content} />;
  }

  if (selectedItem) {
    return (
      <React.Suspense fallback={<div className="min-h-screen bg-[#FDF7EF] flex items-center justify-center">Loading...</div>}>
        <DetailPage 
          item={selectedItem} 
          onBack={() => setSelectedItem(null)} 
          onSelectItem={setSelectedItem}
        />
      </React.Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF7EF] text-[#5C584E] font-sans selection:bg-[#6A665A] selection:text-white overflow-x-clip">
      <Header onNavigateHome={() => setSelectedItem(null)} content={content} />

      {/* Hero Section */}
      <main className="px-4 md:px-12 pb-12 flex justify-center">
        <div className="w-full max-w-[1820px] h-[600px] sm:h-[650px] md:h-[843px] relative rounded-[30px] md:rounded-[50px] overflow-hidden shrink-0 bg-[#2a2a2a]">
          {/* Background Image */}
          <img
            src={content.hero.bgImage}
            className="absolute inset-0 w-full h-full object-cover"
            alt="Hero Background"
            fetchPriority="high"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#454137] to-transparent pointer-events-none"></div>

          {/* Center Content */}
          <div className="absolute inset-x-0 top-[60px] md:top-[100px] flex flex-col justify-center items-center gap-[12px] md:gap-[19px] px-5 pointer-events-none">
            <div className="flex flex-col items-center w-full">
              <p className="text-white font-hedvig text-[36px] sm:text-[40px] md:text-[86px] leading-tight md:leading-[94.6px] text-center tracking-wide">
                {content.hero.title.split('\n').map((line, idx) => (
                  <React.Fragment key={idx}>
                    {line}
                    {idx < content.hero.title.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </p>
            </div>
            <div className="flex max-w-[440px] flex-col items-center text-center">
              <p className="text-white font-inter text-[13px] sm:text-sm md:text-lg font-medium leading-[20px] md:leading-[23.4px]">
                {content.hero.subtitle}
              </p>
            </div>
          </div>

          {/* Radial Glass Tags */}
          <div className="absolute bottom-[-20px] sm:bottom-[-40px] md:bottom-[-65px] left-1/2 -translate-x-1/2 w-0 h-0 flex items-center justify-center pointer-events-none z-10 scale-[0.55] sm:scale-75 md:scale-100">
            {content.hero.radialItems.map((item, i) => {
              const isLeft = item.angle <= 0;
              const isOuter = Math.abs(item.angle) >= 70;
              return (
                <div
                  key={i}
                  className={`absolute origin-bottom ${isOuter ? 'hidden md:block' : ''}`}
                  style={{
                    height: '340px',
                    transform: `rotate(${item.angle}deg)`,
                    bottom: 0,
                  }}
                >
                  <div
                    onClick={() => {
                      document.getElementById('themes-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`absolute top-0 left-1/2 pointer-events-auto cursor-pointer flex items-center justify-center rounded-full backdrop-blur-md border border-white/10 text-white/95 text-xs lg:text-sm font-medium w-[200px] h-[44px] whitespace-nowrap shadow-xl transition-transform hover:scale-105 hover:border-white/30 ${
                      isLeft
                        ? '-translate-x-1/2 -translate-y-1/2 rotate-90 bg-gradient-to-r from-[#2A201A]/80 via-[#2A201A]/40 to-transparent'
                        : '-translate-x-1/2 -translate-y-1/2 -rotate-90 bg-gradient-to-l from-[#2A201A]/80 via-[#2A201A]/40 to-transparent'
                    }`}
                  >
                    {item.title}
                  </div>
                </div>
              );
            })}
          </div>

          {/* User's Exact Cutout Setup */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-[-145px] w-60 h-60 bg-[#FDF7EF] rounded-full z-20">
            {/* Explore Button from User */}
            <button 
              onClick={() => document.getElementById('themes-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="absolute left-0 top-8 w-60 h-11 flex flex-col justify-center items-center gap-[7px] cursor-pointer hover:scale-105 transition-transform pointer-events-auto"
            >
              <div className="w-[18px] h-[18px] relative flex justify-center items-center">
                <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15.7646 13.029C15.6924 12.6406 15.5979 12.2566 15.4816 11.879C14.9356 10.118 14.1236 9.346 13.5396 9.009C12.9556 8.671 11.8856 8.357 10.1046 8.772C9.66265 8.875 9.26165 9.004 8.93765 9.122L8.96765 9.148C9.44665 9.548 10.1356 10.188 10.6986 10.972C11.4036 11.953 11.7616 12.937 11.7616 13.898C11.7616 14.016 11.7566 14.134 11.7456 14.253C12.3456 14.365 13.1416 14.371 14.1786 14.136C14.6056 14.04 14.9956 13.919 15.3156 13.806C15.4708 13.7513 15.6014 13.6429 15.6837 13.5005C15.766 13.358 15.7948 13.1908 15.7646 13.029ZM8.30365 9.97L8.29765 10.008C8.22194 10.4498 8.11942 10.8866 7.99065 11.316C7.64265 12.473 6.94265 14.016 5.58065 14.803C5.47765 14.862 5.37065 14.916 5.26165 14.966C5.68765 16.176 6.72165 17.22 7.43465 17.833C7.55953 17.9407 7.71886 18.0001 7.88378 18.0005C8.04869 18.0009 8.20829 17.9422 8.33365 17.835C9.25265 17.046 10.7036 15.541 10.7036 13.898C10.7036 12.237 9.21965 10.737 8.30365 9.97ZM8.57565 8.132C9.00865 7.974 9.44265 7.843 9.86565 7.745C10.4621 7.60073 11.073 7.52491 11.6866 7.519C12.6046 7.519 13.4046 7.713 14.0666 8.095C14.1626 8.15 14.2626 8.214 14.3666 8.287C14.7636 7.823 15.1666 7.137 15.4826 6.121C15.6126 5.703 15.7026 5.305 15.7646 4.971C15.7948 4.80923 15.766 4.64202 15.6837 4.49954C15.6014 4.35706 15.4708 4.2487 15.3156 4.194C14.9436 4.06243 14.5643 3.95226 14.1796 3.864C12.3806 3.457 11.3066 3.774 10.7216 4.111C10.1346 4.45 9.32365 5.224 8.79365 6.988C8.66465 7.415 8.57765 7.818 8.51965 8.153L8.57565 8.133V8.132ZM7.47965 7.971C7.55765 7.527 7.65965 7.094 7.78265 6.684C8.13065 5.527 8.83065 3.984 10.1926 3.197C10.2966 3.138 10.4026 3.084 10.5126 3.033C10.0866 1.826 9.05265 0.780003 8.33865 0.167003C8.21365 0.0594289 8.05425 0.000183872 7.88933 4.27284e-07C7.72442 -0.000183017 7.56489 0.0587073 7.43965 0.166003C6.52165 0.954003 5.06965 2.459 5.06965 4.102C5.06965 5.764 6.55365 7.262 7.46965 8.029L7.47965 7.971ZM6.79165 8.838C6.31465 8.438 5.62865 7.798 5.06765 7.015C4.36965 6.038 4.01465 5.058 4.01465 4.102C4.01465 3.984 4.02065 3.866 4.03065 3.747C3.43065 3.635 2.63465 3.629 1.59765 3.864C1.21264 3.95215 0.83302 4.06234 0.460647 4.194C0.305449 4.2487 0.174909 4.35706 0.0925767 4.49954C0.0102447 4.64202 -0.018458 4.80923 0.0116468 4.971C0.0746468 5.305 0.164647 5.703 0.294647 6.121C0.840647 7.882 1.65265 8.654 2.23665 8.991C2.82065 9.329 3.89065 9.643 5.67165 9.228C6.06732 9.13488 6.45703 9.018 6.83865 8.878L6.79165 8.838ZM7.20065 9.868C6.77885 10.0229 6.34806 10.1522 5.91065 10.255C5.31453 10.3992 4.70393 10.475 4.09065 10.481C3.17265 10.481 2.37065 10.287 1.70965 9.905C1.60702 9.84574 1.50724 9.78167 1.41065 9.713C1.01365 10.177 0.610647 10.863 0.294647 11.879C0.164647 12.297 0.0746468 12.695 0.0116468 13.029C-0.0184 13.1909 0.0104451 13.3582 0.0929713 13.5007C0.175498 13.6432 0.306263 13.7515 0.461647 13.806C0.781647 13.919 1.17165 14.04 1.59765 14.136C3.39665 14.544 4.47065 14.226 5.05465 13.889C5.64165 13.551 6.45265 12.776 6.98365 11.012C7.11165 10.585 7.19865 10.182 7.25765 9.847L7.20065 9.867V9.868Z" fill="#986A3E"/>
                </svg>
              </div>
              <span className="text-[#4D4943] font-inter text-sm font-medium leading-[18.2px]">
                {content.hero.exploreButtonText}
              </span>
            </button>
            {/* Right Inverted Corner */}
            <svg width="100" height="50" viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute left-[215px] top-[46px] pointer-events-none">
              <path d="M20.0969 49.5454H99.0227C58.5217 49.5454 22.567 30.0825 0 0C10.2502 14.8421 17.1112 31.7566 20.0969 49.5454Z" fill="#FDF7EF"/>
            </svg>
            {/* Left Inverted Corner */}
            <svg width="100" height="50" viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute -left-[74px] top-[46px] pointer-events-none">
              <path d="M78.9258 49.5454H0C40.501 49.5454 76.4557 30.0825 99.0227 0C88.7725 14.8421 81.9115 31.7566 78.9258 49.5454Z" fill="#FDF7EF"/>
            </svg>
          </div>
        </div>
      </main>

      <React.Suspense fallback={<div className="h-40 flex items-center justify-center">Loading...</div>}>
        <WhyChooseUs content={content} />
      </React.Suspense>

      <ThemesSection onSelectItem={setSelectedItem} content={content} />

      <React.Suspense fallback={<div className="h-40 flex items-center justify-center">Loading...</div>}>
        <AboutUs content={content} />
        <Footer content={content} />
      </React.Suspense>
      
      {/* Floating WhatsApp Button */}
      <a 
        href={content.header.bookAppointmentUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-3.5 rounded-full shadow-[0_4px_14px_rgba(37,211,102,0.4)] hover:scale-110 hover:shadow-[0_6px_20px_rgba(37,211,102,0.6)] transition-all duration-300 flex items-center justify-center cursor-pointer"
        title="Chat with us on WhatsApp"
      >
        <svg 
          width="36" 
          height="36" 
          viewBox="0 0 24 24" 
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    </div>
  );
}

