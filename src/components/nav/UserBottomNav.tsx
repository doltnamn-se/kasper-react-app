
import { Link, useLocation } from "react-router-dom";
import { 
  House, 
  UserRoundSearch, 
  EyeOff,
  MapPinHouse,
  MousePointerClick
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";

interface UserBottomNavProps {
  unreadCounts?: {
    monitoring: number;
    deindexing: number;
    addressAlerts: number;
    guides: number;
  }
}

export const UserBottomNav = ({ unreadCounts }: UserBottomNavProps) => {
  const location = useLocation();
  const { t } = useLanguage();

  const isActive = (path: string) => location.pathname === path;

  const renderNavItem = (path: string, icon: React.ReactNode, label: string, unreadCount: number = 0) => {
    const hasNotifications = unreadCount > 0;
    
    return (
      <Link 
        to={path} 
        className={`flex flex-col items-center justify-center relative ${
          isActive(path) 
            ? 'text-black dark:text-white' 
            : 'text-[#000000A6] dark:text-[#FFFFFFA6]'
        }`}
      >
        <div className="relative">
          {icon}
          {hasNotifications && (
            <Badge 
              variant="static" 
              className="absolute -top-2 -right-2 h-4 min-w-4 px-1 flex items-center justify-center bg-[#000000] dark:bg-[#FFFFFF] text-white dark:text-black text-[10px] rounded-full"
            >
              {unreadCount}
            </Badge>
          )}
        </div>
        <span className="text-xs mt-1">{label}</span>
      </Link>
    );
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-[#1c1c1e] border-t border-[#e5e7eb] dark:border-[#232325] md:hidden z-[9999] shadow-md">
      <div className="grid grid-cols-5 h-full">
        {renderNavItem("/", <House className="h-5 w-5" />, t('nav.home'))}
        {renderNavItem("/monitoring", <UserRoundSearch className="h-5 w-5" />, t('nav.monitoring'), unreadCounts?.monitoring)}
        {renderNavItem("/deindexing", <EyeOff className="h-5 w-5" />, t('nav.my.links'), unreadCounts?.deindexing)}
        {renderNavItem("/address-alerts", <MapPinHouse className="h-5 w-5" />, t('nav.address.alerts'), unreadCounts?.addressAlerts)}
        {renderNavItem("/guides", <MousePointerClick className="h-5 w-5" />, t('nav.guides'), unreadCounts?.guides)}
      </div>
    </div>
  );
};
