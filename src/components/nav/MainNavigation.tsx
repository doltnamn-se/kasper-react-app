import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNotifications } from "@/hooks/useNotifications";
import { 
  Bell, 
  Home,
  ShieldAlert,
  Eye,
  FileSearch,
  BookOpen,
  Settings
} from "lucide-react";

interface MainNavigationProps {
  toggleMobileMenu?: () => void;
}

export const MainNavigation = ({ toggleMobileMenu }: MainNavigationProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { unreadCount } = useNotifications();

  const handleNavigation = (path: string) => {
    navigate(path);
    if (toggleMobileMenu) {
      toggleMobileMenu();
    }
  };

  const navigationItems = [
    {
      name: t('nav.home'),
      path: '/',
      icon: Home
    },
    {
      name: t('nav.monitoring'),
      path: '/monitoring',
      icon: Eye
    },
    {
      name: t('nav.my.links'),
      path: '/deindexing',
      icon: FileSearch
    },
    {
      name: t('nav.address.alerts'),
      path: '/address-alerts',
      icon: ShieldAlert
    },
    {
      name: t('nav.guides'),
      path: '/guides',
      icon: BookOpen
    },
    {
      name: t('navigation.settings'),
      path: '/settings',
      icon: Settings
    }
  ];

  return (
    <div className="space-y-1">
      {navigationItems.map((item) => (
        <button
          key={item.path}
          onClick={() => handleNavigation(item.path)}
          className={cn(
            "flex items-center w-full px-3 py-2 text-sm font-medium rounded-md relative",
            location.pathname === item.path
              ? "text-[#2e77d0] bg-[#2e77d0]/10"
              : "text-[#000000A6] hover:text-[#000000] dark:text-[#FFFFFFA6] dark:hover:text-[#FFFFFF] hover:bg-[#00000008] dark:hover:bg-[#FFFFFF08]"
          )}
        >
          <item.icon className="w-5 h-5 mr-3" />
          <span>{item.name}</span>
          {item.path === '/notifications' && unreadCount > 0 && (
            <div className="absolute right-3 top-1/2 -mt-1 h-2 w-2 rounded-full bg-[#2e77d0]" />
          )}
        </button>
      ))}
    </div>
  );
};