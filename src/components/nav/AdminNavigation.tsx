
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation } from "react-router-dom";
import { 
  UsersRound, 
  ChartSpline,
  EyeOff,
  History,
  UserRoundSearch,
  Gift
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface AdminNavigationProps {
  toggleMobileMenu?: () => void;
}

export const AdminNavigation = ({ toggleMobileMenu }: AdminNavigationProps = {}) => {
  const { t } = useLanguage();
  const location = useLocation();

  const renderNavLink = (path: string, icon: React.ReactNode, label: string) => {
    const isActive = location.pathname === path;
    
    const handleClick = () => {
      if (toggleMobileMenu) {
        toggleMobileMenu();
      }
    };
    
    return (
      <Link 
        to={path} 
        className={`flex items-center justify-between gap-3 mb-3 py-2.5 rounded-md ${
          isActive 
            ? "bg-gray-100 dark:bg-[#2d2d2d]" 
            : "hover:bg-gray-100 dark:hover:bg-[#2d2d2d]"
        }`}
        onClick={handleClick}
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
        <ChartSpline className="w-[18px] h-[18px]" />, 
        t('nav.admin.dashboard')
      )}
      
      {renderNavLink("/admin/customers", 
        <UsersRound className="w-[18px] h-[18px]" />, 
        t('nav.admin.customers')
      )}

      {renderNavLink("/admin/monitoring", 
        <UserRoundSearch className="w-[18px] h-[18px]" />, 
        t('nav.admin.monitoring')
      )}

      {renderNavLink("/admin/deindexing", 
        <EyeOff className="w-[18px] h-[18px]" />, 
        t('nav.admin.deindexing')
      )}

      {renderNavLink("/admin/promotional-codes", 
        <Gift className="w-[18px] h-[18px]" />, 
        "Promotional Codes"
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
