
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  ClipboardCheck, 
  EyeOff,
  BookOpen,
  Settings
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export const UserBottomNav = () => {
  const location = useLocation();
  const { t } = useLanguage();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-[#1c1c1e] border-t border-[#e5e7eb] dark:border-[#232325] md:hidden">
      <div className="grid grid-cols-5 h-full">
        <Link 
          to="/" 
          className={`flex flex-col items-center justify-center ${
            isActive('/') 
              ? 'text-black dark:text-white' 
              : 'text-[#000000A6] dark:text-[#FFFFFFA6]'
          }`}
        >
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">{t('nav.overview')}</span>
        </Link>

        <Link 
          to="/checklist" 
          className={`flex flex-col items-center justify-center ${
            isActive('/checklist') 
              ? 'text-black dark:text-white' 
              : 'text-[#000000A6] dark:text-[#FFFFFFA6]'
          }`}
        >
          <ClipboardCheck className="h-5 w-5" />
          <span className="text-xs mt-1">{t('nav.checklist')}</span>
        </Link>

        <Link 
          to="/deindexing" 
          className={`flex flex-col items-center justify-center ${
            isActive('/deindexing') 
              ? 'text-black dark:text-white' 
              : 'text-[#000000A6] dark:text-[#FFFFFFA6]'
          }`}
        >
          <EyeOff className="h-5 w-5" />
          <span className="text-xs mt-1">{t('nav.deindexing')}</span>
        </Link>

        <Link 
          to="/guides" 
          className={`flex flex-col items-center justify-center ${
            isActive('/guides') 
              ? 'text-black dark:text-white' 
              : 'text-[#000000A6] dark:text-[#FFFFFFA6]'
          }`}
        >
          <BookOpen className="h-5 w-5" />
          <span className="text-xs mt-1">{t('nav.guides')}</span>
        </Link>

        <Link 
          to="/settings" 
          className={`flex flex-col items-center justify-center ${
            isActive('/settings') 
              ? 'text-black dark:text-white' 
              : 'text-[#000000A6] dark:text-[#FFFFFFA6]'
          }`}
        >
          <Settings className="h-5 w-5" />
          <span className="text-xs mt-1">{t('nav.settings')}</span>
        </Link>
      </div>
    </div>
  );
};
