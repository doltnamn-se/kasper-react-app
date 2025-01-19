import { TopNav } from "@/components/TopNav";
import { AuthLogo } from "@/components/auth/AuthLogo";
import { APP_VERSION } from "@/config/version";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { House, BadgeCheck, QrCode, MapPinHouse, MousePointerClick, Sparkle, ChevronDown } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <>
      <div className="bg-white dark:bg-[#1c1c1e] border-r border-[#e5e7eb] dark:border-[#232325] w-72 h-screen fixed left-0">
        <div className="px-8 py-6">
          <AuthLogo className="relative h-8" />
        </div>

        <div className="h-px bg-[#e5e7eb] dark:bg-[#232325] mx-6 mb-8 transition-colors duration-200" />

        <div className="px-6">
          <nav>
            <Accordion type="single" collapsible>
              <AccordionItem value="admin" className="border-none">
                <AccordionTrigger 
                  className={`flex items-center gap-3 mb-3 px-5 py-2.5 rounded-md w-full text-left ${
                    location.pathname.startsWith("/admin") 
                      ? "bg-gray-100 dark:bg-gray-800" 
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Sparkle className="w-[18px] h-[18px] text-black dark:text-gray-300" />
                    <span className="text-sm text-black dark:text-gray-300 font-normal">Admin</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-2 pl-11">
                    <Link 
                      to="/admin/dashboard" 
                      className={`text-sm py-2 ${
                        location.pathname === "/admin/dashboard"
                          ? "text-primary dark:text-primary"
                          : "text-black dark:text-gray-300"
                      } font-normal`}
                    >
                      {t('nav.admin.dashboard')}
                    </Link>
                    <Link 
                      to="/admin/customers" 
                      className={`text-sm py-2 ${
                        location.pathname === "/admin/customers"
                          ? "text-primary dark:text-primary"
                          : "text-black dark:text-gray-300"
                      } font-normal`}
                    >
                      {t('nav.admin.customers')}
                    </Link>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="h-px bg-[#e5e7eb] dark:bg-[#232325] mx-2 my-4 transition-colors duration-200" />

            <Link 
              to="/" 
              className={`flex items-center gap-3 mb-3 px-5 py-2.5 rounded-md ${
                location.pathname === "/" 
                  ? "bg-gray-100 dark:bg-gray-800" 
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <House className="w-[18px] h-[18px] text-black dark:text-gray-300" />
              <span className="text-sm text-[#1A1F2C] dark:text-slate-200 font-normal">{t('nav.home')}</span>
            </Link>

            <Link 
              to="/checklist" 
              className={`flex items-center gap-3 mb-3 px-5 py-2.5 rounded-md ${
                location.pathname === "/checklist" 
                  ? "bg-gray-100 dark:bg-gray-800" 
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <BadgeCheck className="w-[18px] h-[18px] text-black dark:text-gray-300" />
              <span className="text-sm text-[#1A1F2C] dark:text-slate-200 font-normal">{t('nav.checklist')}</span>
            </Link>

            <Link 
              to="/my-links" 
              className={`flex items-center gap-3 mb-3 px-5 py-2.5 rounded-md ${
                location.pathname === "/my-links" 
                  ? "bg-gray-100 dark:bg-gray-800" 
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <QrCode className="w-[18px] h-[18px] text-black dark:text-gray-300" />
              <span className="text-sm text-[#1A1F2C] dark:text-slate-200 font-normal">{t('nav.my.links')}</span>
            </Link>

            <Link 
              to="/address-alerts" 
              className={`flex items-center gap-3 mb-3 px-5 py-2.5 rounded-md ${
                location.pathname === "/address-alerts" 
                  ? "bg-gray-100 dark:bg-gray-800" 
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <MapPinHouse className="w-[18px] h-[18px] text-black dark:text-gray-300" />
              <span className="text-sm text-[#1A1F2C] dark:text-slate-200 font-normal">{t('nav.address.alerts')}</span>
            </Link>

            <Link 
              to="/guides" 
              className={`flex items-center gap-3 mb-3 px-5 py-2.5 rounded-md ${
                location.pathname === "/guides" 
                  ? "bg-gray-100 dark:bg-gray-800" 
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <MousePointerClick className="w-[18px] h-[18px] text-black dark:text-gray-300" />
              <span className="text-sm text-[#1A1F2C] dark:text-slate-200 font-normal">{t('nav.guides')}</span>
            </Link>
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 px-6 py-4 flex justify-between items-center">
          <LanguageSwitch />
          <span className="text-xs text-[#5e5e5e] dark:text-gray-400">v{APP_VERSION}</span>
        </div>
      </div>

      <div className="ml-72 min-h-screen bg-[#f4f4f4] dark:bg-[#161618] transition-colors duration-200">
        <TopNav />
        <main className="px-8 pt-24">
          {/* Removed the max-w-5xl and px-8 constraints */}
          <div>
            {children}
          </div>
        </main>
      </div>
    </>
  );
};