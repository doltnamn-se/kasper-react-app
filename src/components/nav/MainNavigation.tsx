import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";

interface MainNavigationProps {
  toggleMobileMenu?: () => void;
}

export const MainNavigation = ({ toggleMobileMenu }: MainNavigationProps) => {
  const { t } = useLanguage();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const links = [
    { href: "/", label: t('nav.home') },
    { href: "/checklist", label: t('nav.checklist') },
    { href: "/avindexering", label: t('nav.my.links') },
    { href: "/address-alerts", label: t('nav.address.alerts') },
    { href: "/guides", label: t('nav.guides') },
  ];

  return (
    <div className="space-y-1">
      {links.map((link) => (
        <Link
          key={link.href}
          to={link.href}
          onClick={toggleMobileMenu}
          className={cn(
            "flex items-center text-[15px] font-medium px-3 py-2 rounded-[4px] transition-colors duration-200",
            isActive(link.href)
              ? "text-sidebar-primary-foreground bg-sidebar-primary"
              : "text-sidebar-foreground hover:text-sidebar-primary-foreground hover:bg-sidebar-primary"
          )}
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
};