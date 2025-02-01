import { Link, useLocation } from "react-router-dom";
import { House, BadgeCheck, UserRoundSearch, QrCode, MapPinHouse, MousePointerClick } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface NavigationLinksProps {
  unreadCounts: {
    total: number;
    checklist: number;
    monitoring: number;
    deindexing: number;
    addressAlerts: number;
    guides: number;
  };
  toggleMobileMenu: () => void;
}

export const NavigationLinks = ({ unreadCounts, toggleMobileMenu }: NavigationLinksProps) => {
  const location = useLocation();
  const { t } = useLanguage();

  const renderNavLink = (path: string, icon: React.ReactNode, label: string, unreadCount: number = 0) => {
    const isActive = location.pathname === path;
    const hasNotification = unreadCount > 0;
    
    return (
      <Link 
        to={path} 
        className={`flex items-center justify-between gap-3 mb-3 py-2.5 px-3 rounded-md ${
          isActive 
            ? "bg-gray-100 dark:bg-[#2d2d2d]" 
            : "hover:bg-gray-100 dark:hover:bg-[#2d2d2d]"
        }`}
        onClick={toggleMobileMenu}
      >
        <div className="flex items-center gap-3">
          <span className="text-black dark:text-white">{icon}</span>
          <span className="text-sm text-[#000000] dark:text-white font-medium">{label}</span>
        </div>
        {hasNotification && (
          <div className="h-2 w-2 rounded-full bg-[#2e77d0]" />
        )}
      </Link>
    );
  };

  return (
    <>
      {renderNavLink("/", <House className="w-[18px] h-[18px]" />, t('nav.home'), unreadCounts.total)}
      {renderNavLink("/checklist", <BadgeCheck className="w-[18px] h-[18px]" />, t('nav.checklist'), unreadCounts.checklist)}
      {renderNavLink("/monitoring", <UserRoundSearch className="w-[18px] h-[18px]" />, t('nav.monitoring'), unreadCounts.monitoring)}
      {renderNavLink("/deindexing", <QrCode className="w-[18px] h-[18px]" />, t('nav.my.links'), unreadCounts.deindexing)}
      {renderNavLink("/address-alerts", <MapPinHouse className="w-[18px] h-[18px]" />, t('nav.address.alerts'), unreadCounts.addressAlerts)}
      {renderNavLink("/guides", <MousePointerClick className="w-[18px] h-[18px]" />, t('nav.guides'), unreadCounts.guides)}
    </>
  );
};