
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation } from "react-router-dom";
import { 
  Users, 
  ChartNoAxesGantt,
  Link as LinkIcon
} from "lucide-react";

interface AdminNavigationProps {
  toggleMobileMenu?: () => void;
}

export const AdminNavigation = ({ toggleMobileMenu }: AdminNavigationProps) => {
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
        onClick={toggleMobileMenu}
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
        <Users className="w-[18px] h-[18px]" />, 
        t('nav.admin.customers')
      )}

      {renderNavLink("/admin/deindexing", 
        <LinkIcon className="w-[18px] h-[18px]" />, 
        t('nav.my.links')
      )}
    </nav>
  );
};

