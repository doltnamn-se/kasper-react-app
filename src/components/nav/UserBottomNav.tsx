
import { Link, useLocation } from "react-router-dom";
import { 
  House, 
  UserRoundSearch, 
  EyeOff,
  MapPinHouse,
  Infinity
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useRef, useState } from "react";

export const UserBottomNav = () => {
  const location = useLocation();
  const { t } = useLanguage();
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const navRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const navItems = [
    { path: '/', icon: <House className="h-5 w-5" />, label: t('nav.home') },
    { path: '/monitoring', icon: <UserRoundSearch className="h-5 w-5" />, label: t('nav.monitoring') },
    { path: '/deindexing', icon: <EyeOff className="h-5 w-5" />, label: t('nav.my.links') },
    { path: '/address-alerts', icon: <MapPinHouse className="h-5 w-5" />, label: t('nav.address.alerts.mobile') },
    { path: '/kasper-friends', icon: <Infinity className="h-5 w-5" />, label: "Friends" }
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

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-white dark:bg-[#1c1c1e] border-t border-[#e5e7eb] dark:border-[#232325] md:hidden z-[9999] shadow-md">
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
      
      <div className="grid grid-cols-5 h-full">
        {navItems.map((item, index) => (
          <Link 
            key={item.path}
            to={item.path} 
            ref={el => navRefs.current[index] = el}
            className={`flex flex-col items-center justify-center pb-3 ${
              isActive(item.path) 
                ? 'text-[#121212] dark:text-[#fafafa] font-medium' 
                : 'text-[#121212] dark:text-[#fafafa] font-normal'
            }`}
          >
            {item.icon}
            <span className="mt-1" style={{ fontSize: '0.7rem' }}>{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};
