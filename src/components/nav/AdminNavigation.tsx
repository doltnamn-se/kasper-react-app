import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Users, 
  LayoutDashboard,
  Link as LinkIcon
} from "lucide-react";

export const AdminNavigation = () => {
  const { t } = useLanguage();

  return (
    <nav className="space-y-2">
      <Link
        to="/admin"
        className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
      >
        <LayoutDashboard className="w-4 h-4" />
        <span>{t('navigation.dashboard')}</span>
      </Link>
      
      <Link
        to="/admin/customers"
        className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
      >
        <Users className="w-4 h-4" />
        <span>{t('navigation.customers')}</span>
      </Link>

      <Link
        to="/admin/deindexing"
        className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
      >
        <LinkIcon className="w-4 h-4" />
        <span>{t('navigation.url_management')}</span>
      </Link>
    </nav>
  );
};