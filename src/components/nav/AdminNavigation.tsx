
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation } from "react-router-dom";
import { 
  UsersRound, 
  ChartNoAxesGantt,
  EyeOff,
  History
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

export const AdminNavigation = () => {
  const { t } = useLanguage();
  const location = useLocation();

  const renderNavLink = (path: string, icon: React.ReactNode, label: string) => {
    const isActive = location.pathname === path;
    
    return (
      <Link 
        to={path} 
        className={`flex items-center justify-between gap-3 mb-3 py-2.5 rounded-md ${
          isActive 
            ? "bg-gray-100 dark:bg-[#2d2d2d]" 
            : "hover:bg-gray-100 dark:hover:bg-[#2d2d2d]"
        }`}
      >
        <div className="flex items-center gap-3 px-3">
          <span className="text-black dark:text-white">{icon}</span>
          <span className="text-sm text-[#000000] dark:text-white font-medium">{label}</span>
        </div>
      </Link>
    );
  };

  return (
    <nav className="space-y-2">
      {renderNavLink("/admin", 
        <ChartNoAxesGantt className="w-[18px] h-[18px]" />, 
        t('nav.admin.dashboard')
      )}
      
      {renderNavLink("/admin/customers", 
        <UsersRound className="w-[18px] h-[18px]" />, 
        t('nav.admin.customers')
      )}

      {renderNavLink("/admin/deindexing", 
        <EyeOff className="w-[18px] h-[18px]" />, 
        t('nav.admin.links')
      )}
      
      <div className="py-1">
        <Separator className="bg-[#e5e7eb] dark:bg-[#2d2d2d]" />
      </div>

      {renderNavLink("/admin/version-log", 
        <History className="w-[18px] h-[18px]" />, 
        t('nav.admin.version.log')
      )}
    </nav>
  );
};
