
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, EyeOff, History, MonitorSmartphone } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export const AdminBottomNav = () => {
  const location = useLocation();
  const { t } = useLanguage();
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-[#1c1c1e] border-t border-[#e5e7eb] dark:border-[#232325] md:hidden z-[9999] shadow-md">
      <div className="grid grid-cols-5 h-full">
        <Link 
          to="/admin" 
          className={`flex flex-col items-center justify-center relative ${
            isActive('/admin') 
              ? 'text-black dark:text-white font-medium before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] before:bg-black dark:before:bg-white' 
              : 'text-[#000000A6] dark:text-[#FFFFFFA6] font-normal'
          }`}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span className="text-xs mt-1">{t('nav.dashboard')}</span>
        </Link>

        <Link 
          to="/admin/customers" 
          className={`flex flex-col items-center justify-center relative ${
            isActive('/admin/customers') 
              ? 'text-black dark:text-white font-medium before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] before:bg-black dark:before:bg-white' 
              : 'text-[#000000A6] dark:text-[#FFFFFFA6] font-normal'
          }`}
        >
          <Users className="h-5 w-5" />
          <span className="text-xs mt-1">{t('nav.customers')}</span>
        </Link>

        <Link 
          to="/admin/deindexing" 
          className={`flex flex-col items-center justify-center relative ${
            isActive('/admin/deindexing') 
              ? 'text-black dark:text-white font-medium before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] before:bg-black dark:before:bg-white' 
              : 'text-[#000000A6] dark:text-[#FFFFFFA6] font-normal'
          }`}
        >
          <EyeOff className="h-5 w-5" />
          <span className="text-xs mt-1">{t('nav.links')}</span>
        </Link>

        <Link 
          to="/admin/monitoring" 
          className={`flex flex-col items-center justify-center relative ${
            isActive('/admin/monitoring') 
              ? 'text-black dark:text-white font-medium before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] before:bg-black dark:before:bg-white' 
              : 'text-[#000000A6] dark:text-[#FFFFFFA6] font-normal'
          }`}
        >
          <MonitorSmartphone className="h-5 w-5" />
          <span className="text-xs mt-1">{t('nav.monitoring')}</span>
        </Link>

        <Link 
          to="/admin/version-log" 
          className={`flex flex-col items-center justify-center relative ${
            isActive('/admin/version-log') 
              ? 'text-black dark:text-white font-medium before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] before:bg-black dark:before:bg-white' 
              : 'text-[#000000A6] dark:text-[#FFFFFFA6] font-normal'
          }`}
        >
          <History className="h-5 w-5" />
          <span className="text-xs mt-1">{t('nav.version.log')}</span>
        </Link>
      </div>
    </div>
  );
};
