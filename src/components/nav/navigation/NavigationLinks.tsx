
import { Link, useLocation } from "react-router-dom";
import { UserRoundSearch, EyeOff, MapPinHouse, MousePointerClick, Infinity } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import kasperFaviconDark from "/lovable-uploads/kasper-mob-icon-darkmode.svg";
import kasperFaviconLight from "/lovable-uploads/kasper-mob-icon-lightmode.svg";

interface NavigationLinksProps {
  unreadCounts: {
    total: number;
    checklist?: number; // Made optional
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
          <div className="flex items-center justify-center h-5 px-2.5 rounded-full bg-[#000000] dark:bg-[#FFFFFF] text-white dark:text-black text-xs font-medium">
            <span className="pr-[0.5px] pt-[0.5px]">{unreadCount}</span>
          </div>
        )}
      </Link>
    );
  };

  console.log('Unread counts:', unreadCounts);

  return (
    <>
      {renderNavLink("/", (
        <>
          <img src={kasperFaviconLight} alt="Home" className="w-[18px] h-[18px] dark:hidden" />
          <img src={kasperFaviconDark} alt="Home" className="w-[18px] h-[18px] hidden dark:block" />
        </>
      ), t('nav.home'), unreadCounts.total)}
      {renderNavLink("/deindexing", <EyeOff className="w-[18px] h-[18px]" />, t('nav.my.links'), unreadCounts.deindexing)}
      {renderNavLink("/kasper-friends", <Infinity className="w-[18px] h-[18px]" />, "Kasper Friends", 0)}
      {renderNavLink("/monitoring", <UserRoundSearch className="w-[18px] h-[18px]" />, t('nav.monitoring'), unreadCounts.monitoring)}
      {renderNavLink("/address-alerts", <MapPinHouse className="w-[18px] h-[18px]" />, t('nav.address.alerts'), unreadCounts.addressAlerts)}
      {renderNavLink("/guides", <MousePointerClick className="w-[18px] h-[18px]" />, t('nav.guides'), unreadCounts.guides)}
    </>
  );
};
