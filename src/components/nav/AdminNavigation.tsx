import { Link, useLocation } from "react-router-dom";
import { Sparkle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface AdminNavigationProps {
  toggleMobileMenu: () => void;
}

export const AdminNavigation = ({ toggleMobileMenu }: AdminNavigationProps) => {
  const location = useLocation();
  const { t } = useLanguage();

  return (
    <>
      <Accordion type="single" collapsible>
        <AccordionItem value="admin" className="border-none">
          <AccordionTrigger 
            className={`flex items-center gap-3 mb-3 px-5 py-2.5 rounded-md w-full text-left ${
              location.pathname.startsWith("/admin") 
                ? "bg-gray-100 dark:bg-[#2d2d2d]" 
                : "hover:bg-gray-100 dark:hover:bg-[#2d2d2d]"
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
                onClick={toggleMobileMenu}
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
                onClick={toggleMobileMenu}
              >
                {t('nav.admin.customers')}
              </Link>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="h-px bg-[#e5e7eb] dark:bg-[#232325] mx-2 my-4 transition-colors duration-200" />
    </>
  );
};