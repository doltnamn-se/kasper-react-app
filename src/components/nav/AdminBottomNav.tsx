
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, EyeOff, History, MonitorSmartphone } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useRef, useState } from "react";

export const AdminBottomNav = () => {
  const location = useLocation();
  const { t } = useLanguage();
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const navRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  
  const navItems = [
    { path: '/admin', icon: <LayoutDashboard className="h-5 w-5" />, label: t('nav.dashboard') },
    { path: '/admin/customers', icon: <Users className="h-5 w-5" />, label: t('nav.customers') },
    { path: '/admin/deindexing', icon: <EyeOff className="h-5 w-5" />, label: t('nav.links') },
    { path: '/admin/monitoring', icon: <MonitorSmartphone className="h-5 w-5" />, label: t('nav.monitoring') },
    { path: '/admin/version-log', icon: <History className="h-5 w-5" />, label: t('nav.version.log') }
  ];
  
  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const updateIndicator = () => {
      const activeIndex = navItems.findIndex(item => isActive(item.path));
      if (activeIndex !== -1 && navRefs.current[activeIndex]) {
        const activeItem = navRefs.current[activeIndex];
        if (activeItem) {
          const { offsetLeft, offsetWidth } = activeItem;
          setIndicatorStyle({ left: offsetLeft, width: offsetWidth });
        }
      }
    };

    updateIndicator();
    // Re-calculate when window resizes
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [location.pathname]);

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-[#1c1c1e] border-t border-[#e5e7eb] dark:border-[#232325] md:hidden z-[9999] shadow-md">
      <div className="relative">
        {/* Active indicator */}
        <div 
          className="absolute top-0 h-0.5 bg-black dark:bg-white transition-all duration-300 ease-in-out"
          style={{ left: `${indicatorStyle.left}px`, width: `${indicatorStyle.width}px` }}
        />
      </div>
      
      <div className="grid grid-cols-5 h-full">
        {navItems.map((item, index) => (
          <Link 
            key={item.path}
            to={item.path} 
            ref={el => navRefs.current[index] = el}
            className={`flex flex-col items-center justify-center ${
              isActive(item.path) 
                ? 'text-black dark:text-white font-medium' 
                : 'text-[#000000A6] dark:text-[#FFFFFFA6] font-normal'
            }`}
          >
            {item.icon}
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};
