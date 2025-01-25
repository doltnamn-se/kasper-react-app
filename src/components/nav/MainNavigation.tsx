import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Home, 
  ClipboardCheck, 
  Link2, 
  Bell, 
  BookOpen, 
  Settings 
} from "lucide-react";

interface MainNavigationProps {
  toggleMobileMenu?: () => void;
}

export const MainNavigation = ({ toggleMobileMenu }: MainNavigationProps) => {
  const location = useLocation();
  const { t } = useLanguage();

  const isActive = (path: string) => location.pathname === path;

  const navigationItems = [
    { path: "/", icon: Home, label: t('nav.home') },
    { path: "/checklist", icon: ClipboardCheck, label: t('nav.checklist') },
    { path: "/deindexing", icon: Link2, label: t('nav.deindexing') },
    { path: "/address-alerts", icon: Bell, label: t('nav.address.alerts') },
    { path: "/guides", icon: BookOpen, label: t('nav.guides') },
    { path: "/settings", icon: Settings, label: t('nav.settings') }
  ];

  return (
    <div className="space-y-1">
      {navigationItems.map(({ path, icon: Icon, label }) => (
        <Link
          key={path}
          to={path}
          onClick={toggleMobileMenu}
          className={cn(
            "flex items-center w-full px-3 py-2 text-sm transition-colors rounded-md group",
            isActive(path)
              ? "bg-[#f3f4f6] text-black dark:bg-[#2d2d2d] dark:text-white"
              : "text-[#4B5563] hover:bg-[#f3f4f6] dark:text-[#9CA3AF] dark:hover:bg-[#2d2d2d] dark:hover:text-white"
          )}
        >
          <Icon className="w-4 h-4 mr-3 shrink-0" />
          <span className="truncate">{label}</span>
        </Link>
      ))}
    </div>
  );
};