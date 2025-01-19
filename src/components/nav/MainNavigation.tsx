import { Link, useLocation } from "react-router-dom";
import { House, BadgeCheck, QrCode, MapPinHouse, MousePointerClick } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface MainNavigationProps {
  toggleMobileMenu: () => void;
}

export const MainNavigation = ({ toggleMobileMenu }: MainNavigationProps) => {
  const location = useLocation();
  const { t } = useLanguage();

  return (
    <>
      <Link 
        to="/" 
        className={`flex items-center gap-3 mb-3 px-5 py-2.5 rounded-md ${
          location.pathname === "/" 
            ? "bg-gray-100 dark:bg-[#2d2d2d]" 
            : "hover:bg-gray-100 dark:hover:bg-[#2d2d2d]"
        }`}
        onClick={toggleMobileMenu}
      >
        <House className="w-[18px] h-[18px] text-black dark:text-gray-300" />
        <span className="text-sm text-[#1A1F2C] dark:text-slate-200 font-normal">{t('nav.home')}</span>
      </Link>

      <Link 
        to="/checklist" 
        className={`flex items-center gap-3 mb-3 px-5 py-2.5 rounded-md ${
          location.pathname === "/checklist" 
            ? "bg-gray-100 dark:bg-[#2d2d2d]" 
            : "hover:bg-gray-100 dark:hover:bg-[#2d2d2d]"
        }`}
        onClick={toggleMobileMenu}
      >
        <BadgeCheck className="w-[18px] h-[18px] text-black dark:text-gray-300" />
        <span className="text-sm text-[#1A1F2C] dark:text-slate-200 font-normal">{t('nav.checklist')}</span>
      </Link>

      <Link 
        to="/my-links" 
        className={`flex items-center gap-3 mb-3 px-5 py-2.5 rounded-md ${
          location.pathname === "/my-links" 
            ? "bg-gray-100 dark:bg-[#2d2d2d]" 
            : "hover:bg-gray-100 dark:hover:bg-[#2d2d2d]"
        }`}
        onClick={toggleMobileMenu}
      >
        <QrCode className="w-[18px] h-[18px] text-black dark:text-gray-300" />
        <span className="text-sm text-[#1A1F2C] dark:text-slate-200 font-normal">{t('nav.my.links')}</span>
      </Link>

      <Link 
        to="/address-alerts" 
        className={`flex items-center gap-3 mb-3 px-5 py-2.5 rounded-md ${
          location.pathname === "/address-alerts" 
            ? "bg-gray-100 dark:bg-[#2d2d2d]" 
            : "hover:bg-gray-100 dark:hover:bg-[#2d2d2d]"
        }`}
        onClick={toggleMobileMenu}
      >
        <MapPinHouse className="w-[18px] h-[18px] text-black dark:text-gray-300" />
        <span className="text-sm text-[#1A1F2C] dark:text-slate-200 font-normal">{t('nav.address.alerts')}</span>
      </Link>

      <Link 
        to="/guides" 
        className={`flex items-center gap-3 mb-3 px-5 py-2.5 rounded-md ${
          location.pathname === "/guides" 
            ? "bg-gray-100 dark:bg-[#2d2d2d]" 
            : "hover:bg-gray-100 dark:hover:bg-[#2d2d2d]"
        }`}
        onClick={toggleMobileMenu}
      >
        <MousePointerClick className="w-[18px] h-[18px] text-black dark:text-gray-300" />
        <span className="text-sm text-[#1A1F2C] dark:text-slate-200 font-normal">{t('nav.guides')}</span>
      </Link>
    </>
  );
};