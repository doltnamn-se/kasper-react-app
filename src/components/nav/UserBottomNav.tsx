
import { Link, useLocation } from "react-router-dom";
import { 
  UserRoundSearch, 
  EyeOff,
  MapPinHouse,
  Infinity
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useRef, useState } from "react";
import { isIOS, isAndroid } from "@/capacitor";
import kasperFaviconDark from "/lovable-uploads/kasper-mob-icon-darkmode.svg";
import kasperFaviconLight from "/lovable-uploads/kasper-mob-icon-lightmode.svg";

export const UserBottomNav = () => {
  const location = useLocation();
  const { t } = useLanguage();
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const navRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const navItems = [
    { path: '/', icon: (
        <>
          <img src={kasperFaviconLight} alt="Home" className="h-5 w-5 dark:hidden" />
          <img src={kasperFaviconDark} alt="Home" className="h-5 w-5 hidden dark:block" />
        </>
      ), label: t('nav.home') },
    { path: '/deindexing', icon: <EyeOff className="h-5 w-5" />, label: t('nav.my.links') },
    { path: '/kasper-friends', icon: <Infinity className="h-5 w-5" />, label: "Friends" },
    { path: '/monitoring', icon: <UserRoundSearch className="h-5 w-5" />, label: t('nav.monitoring') },
    { path: '/address-alerts', icon: <MapPinHouse className="h-5 w-5" />, label: t('nav.address.alerts.mobile') }
  ];

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const updateIndicator = () => {
      const activeIndex = navItems.findIndex(item => isActive(item.path));
      if (activeIndex !== -1 && navRefs.current[activeIndex]) {
        const activeItem = navRefs.current[activeIndex];
        if (activeItem) {
          const { offsetLeft, offsetWidth } = activeItem;
          // Use requestAnimationFrame for smooth animation
          requestAnimationFrame(() => {
            setIndicatorStyle({ left: offsetLeft, width: offsetWidth });
          });
        }
      }
    };

    // Initialize indicator position when component mounts or route changes
    updateIndicator();
    
    // Re-calculate when window resizes
    window.addEventListener('resize', updateIndicator);
    
    // Set a short timeout to ensure DOM is fully rendered
    const timeoutId = setTimeout(updateIndicator, 50);
    
    return () => {
      window.removeEventListener('resize', updateIndicator);
      clearTimeout(timeoutId);
    };
  }, [location.pathname, navItems]);

  const isNative = isIOS() || isAndroid();

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-[#1c1c1e] border-t border-[#e5e7eb] dark:border-[#232325] md:hidden z-[9999] shadow-md"
      style={{
        paddingBottom: isNative ? (isIOS() ? 'calc(env(safe-area-inset-bottom) - 20px)' : 'env(safe-area-inset-bottom)') : undefined,
        height: isNative ? (isIOS() ? 'calc(3.5rem + env(safe-area-inset-bottom))' : 'calc(4rem + env(safe-area-inset-bottom))') : undefined
      }}
    >
      <div className="relative">
        {/* Active indicator - positioned absolutely and will slide with transitions */}
        <div 
          className="absolute top-0 h-0.5 bg-black dark:bg-white transition-all duration-300 ease-in-out"
          style={{ 
            left: `${indicatorStyle.left}px`, 
            width: `${indicatorStyle.width}px`,
            transform: 'translateZ(0)' // Force GPU acceleration
          }}
        />
      </div>
      
      <div className="grid grid-cols-5 h-full" style={{ marginTop: isIOS() ? '-8px' : undefined }}>
        {navItems.map((item, index) => (
          <Link 
            key={item.path}
            to={item.path} 
            ref={el => navRefs.current[index] = el}
            className="flex flex-col items-center justify-center text-[#121212] dark:text-[#fafafa] font-medium"
            style={{ gap: isIOS() ? '1px' : '4px' }}
          >
            {item.icon}
            <span style={{ fontSize: '0.7rem' }}>{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};
