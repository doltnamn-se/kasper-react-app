import { useLanguage } from "@/contexts/LanguageContext";
import { Link, useLocation } from "react-router-dom";

export const AdminNavigation = () => {
  const { t } = useLanguage();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="space-y-1">
      <Link
        to="/admin"
        className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
          isActive("/admin")
            ? "bg-[#e5e5e5] dark:bg-[#303032] text-black dark:text-white"
            : "text-gray-600 hover:bg-[#e5e5e5] dark:hover:bg-[#303032] dark:text-gray-300"
        }`}
      >
        {t('nav.admin.dashboard')}
      </Link>
    </nav>
  );
};