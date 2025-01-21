import { Link, useLocation } from "react-router-dom";
import { House, BadgeCheck, QrCode, MapPinHouse, MousePointerClick } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNotifications } from "@/hooks/useNotifications";
import { Badge } from "@/components/ui/badge";

interface MainNavigationProps {
  toggleMobileMenu: () => void;
}

export const MainNavigation = ({ toggleMobileMenu }: MainNavigationProps) => {
  const location = useLocation();
  const { t } = useLanguage();
  const [isAdmin, setIsAdmin] = useState(false);
  const { notifications = [] } = useNotifications();

  // Get unread notifications count for each section
  const getUnreadCount = (path: string) => {
    return notifications.filter(n => !n.read && n.type === path.replace('/', '')).length;
  };

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email === 'info@doltnamn.se') {
        setIsAdmin(true);
      }
    };

    checkAdminStatus();
  }, []);

  if (isAdmin) {
    return null;
  }

  const renderNavLink = (path: string, icon: React.ReactNode, label: string) => {
    const unreadCount = getUnreadCount(path);
    const isActive = location.pathname === path;
    
    return (
      <Link 
        to={path} 
        className={`flex items-center justify-between gap-3 mb-3 px-5 py-2.5 rounded-md ${
          isActive 
            ? "bg-gray-100 dark:bg-[#2d2d2d]" 
            : "hover:bg-gray-100 dark:hover:bg-[#2d2d2d]"
        }`}
        onClick={toggleMobileMenu}
      >
        <div className="flex items-center gap-3">
          <span className="text-black dark:text-gray-300">{icon}</span>
          <span className="text-sm text-[#1A1F2C] dark:text-slate-200 font-normal">{label}</span>
        </div>
        {unreadCount > 0 && (
          <Badge 
            className="h-3.5 w-3.5 p-0 flex items-center justify-center text-[9px] leading-none bg-badge-subscription-bg dark:bg-badge-subscription-bg-dark text-[#001400] border-0"
          >
            {unreadCount}
          </Badge>
        )}
      </Link>
    );
  };

  return (
    <>
      {renderNavLink("/", <House className="w-[18px] h-[18px]" />, t('nav.home'))}
      {renderNavLink("/checklist", <BadgeCheck className="w-[18px] h-[18px]" />, t('nav.checklist'))}
      {renderNavLink("/my-links", <QrCode className="w-[18px] h-[18px]" />, t('nav.my.links'))}
      {renderNavLink("/address-alerts", <MapPinHouse className="w-[18px] h-[18px]" />, t('nav.address.alerts'))}
      {renderNavLink("/guides", <MousePointerClick className="w-[18px] h-[18px]" />, t('nav.guides'))}
    </>
  );
};