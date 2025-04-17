
import { Link, useLocation } from "react-router-dom";
import { 
  House, 
  UserRoundSearch, 
  EyeOff,
  MapPinHouse,
  MousePointerClick
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export const UserBottomNav = () => {
  const location = useLocation();
  const { t } = useLanguage();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-[#1c1c1e] border-t border-[#e5e7eb] dark:border-[#232325] md:hidden z-[9999] shadow-md">
      <div className="grid grid-cols-5 h-full">
        <Link 
          to="/" 
          className={`flex flex-col items-center justify-center ${
            isActive('/') 
              ? 'text-black dark:text-white font-medium' 
              : 'text-[#000000A6] dark:text-[#FFFFFFA6] font-normal'
          }`}
        >
          <House className="h-5 w-5" />
          <span className="text-xs mt-1">{t('nav.home')}</span>
        </Link>

        <Link 
          to="/monitoring" 
          className={`flex flex-col items-center justify-center ${
            isActive('/monitoring') 
              ? 'text-black dark:text-white font-medium' 
              : 'text-[#000000A6] dark:text-[#FFFFFFA6] font-normal'
          }`}
        >
          <UserRoundSearch className="h-5 w-5" />
          <span className="text-xs mt-1">{t('nav.monitoring')}</span>
        </Link>

        <Link 
          to="/deindexing" 
          className={`flex flex-col items-center justify-center ${
            isActive('/deindexing') 
              ? 'text-black dark:text-white font-medium' 
              : 'text-[#000000A6] dark:text-[#FFFFFFA6] font-normal'
          }`}
        >
          <EyeOff className="h-5 w-5" />
          <span className="text-xs mt-1">{t('nav.my.links')}</span>
        </Link>

        <Link 
          to="/address-alerts" 
          className={`flex flex-col items-center justify-center ${
            isActive('/address-alerts') 
              ? 'text-black dark:text-white font-medium' 
              : 'text-[#000000A6] dark:text-[#FFFFFFA6] font-normal'
          }`}
        >
          <MapPinHouse className="h-5 w-5" />
          <span className="text-xs mt-1">{t('nav.address.alerts')}</span>
        </Link>

        <Link 
          to="/guides" 
          className={`flex flex-col items-center justify-center ${
            isActive('/guides') 
              ? 'text-black dark:text-white font-medium' 
              : 'text-[#000000A6] dark:text-[#FFFFFFA6] font-normal'
          }`}
        >
          <MousePointerClick className="h-5 w-5" />
          <span className="text-xs mt-1">{t('nav.guides')}</span>
        </Link>
      </div>
    </div>
  );
};
