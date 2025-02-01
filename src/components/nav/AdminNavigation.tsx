import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Users, 
  LayoutDashboard,
  Link as LinkIcon
} from "lucide-react";

interface AdminNavigationProps {
  toggleMobileMenu?: () => void;
}

export const AdminNavigation = ({ toggleMobileMenu }: AdminNavigationProps) => {
  const { t } = useLanguage();

  return (
    <nav className="space-y-2">
      <Link
        to="/admin"
        className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
        onClick={toggleMobileMenu}
      >
        <LayoutDashboard className="w-4 h-4" />
        <span>{t('nav.admin.dashboard')}</span>
      </Link>
      
      <Link
        to="/admin/customers"
        className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
        onClick={toggleMobileMenu}
      >
        <Users className="w-4 h-4" />
        <span>{t('nav.admin.customers')}</span>
      </Link>

      <Link
        to="/admin/deindexing"
        className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
        onClick={toggleMobileMenu}
      >
        <LinkIcon className="w-4 h-4" />
        <span>{t('nav.my.links')}</span>
      </Link>
    </nav>
  );
};