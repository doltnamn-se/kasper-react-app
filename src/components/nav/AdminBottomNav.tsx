
import { Link, useLocation } from "react-router-dom";
import { 
  ChartNoAxesGantt, 
  UsersRound, 
  EyeOff, 
  History 
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export const AdminBottomNav = () => {
  const location = useLocation();
  const { t } = useLanguage();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-[#1c1c1e] border-t border-[#e5e7eb] dark:border-[#232325] md:hidden">
      <div className="grid grid-cols-4 h-full">
        <Link 
          to="/admin" 
          className={`flex flex-col items-center justify-center ${
            isActive('/admin') 
              ? 'text-black dark:text-white' 
              : 'text-[#000000A6] dark:text-[#FFFFFFA6]'
          }`}
        >
          <ChartNoAxesGantt className="h-5 w-5" />
          <span className="text-xs mt-1">{t('nav.admin.dashboard')}</span>
        </Link>

        <Link 
          to="/admin/customers" 
          className={`flex flex-col items-center justify-center ${
            isActive('/admin/customers') 
              ? 'text-black dark:text-white' 
              : 'text-[#000000A6] dark:text-[#FFFFFFA6]'
          }`}
        >
          <UsersRound className="h-5 w-5" />
          <span className="text-xs mt-1">{t('nav.admin.customers')}</span>
        </Link>

        <Link 
          to="/admin/deindexing" 
          className={`flex flex-col items-center justify-center ${
            isActive('/admin/deindexing') 
              ? 'text-black dark:text-white' 
              : 'text-[#000000A6] dark:text-[#FFFFFFA6]'
          }`}
        >
          <EyeOff className="h-5 w-5" />
          <span className="text-xs mt-1">{t('nav.admin.links')}</span>
        </Link>

        <Link 
          to="/admin/version-log" 
          className={`flex flex-col items-center justify-center ${
            isActive('/admin/version-log') 
              ? 'text-black dark:text-white' 
              : 'text-[#000000A6] dark:text-[#FFFFFFA6]'
          }`}
        >
          <History className="h-5 w-5" />
          <span className="text-xs mt-1">{t('nav.admin.version.log')}</span>
        </Link>
      </div>
    </div>
  );
};
