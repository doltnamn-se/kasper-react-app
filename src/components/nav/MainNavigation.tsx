import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Home,
  ClipboardList,
  Link2Off,
  Bell,
  BookOpen,
} from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";

export const MainNavigation = () => {
  const location = useLocation();
  const { t } = useLanguage();
  const { isAdmin } = useUserProfile();

  const navigation = [
    { name: t('nav.home'), href: '/', icon: Home },
    { name: t('nav.checklist'), href: '/checklist', icon: ClipboardList },
    { name: t('nav.my.links'), href: '/my-links', icon: Link2Off },
    { name: t('nav.address.alerts'), href: '/address-alerts', icon: Bell },
    { name: t('nav.guides'), href: '/guides', icon: BookOpen },
  ];

  return (
    <nav className="space-y-0.5">
      {navigation.map((item) => {
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              isActive
                ? "bg-[#f8f8f8] text-[#000000] dark:bg-[#1c1c1e] dark:text-white"
                : "text-[#6b7280] hover:text-[#000000] dark:text-[#98989e] dark:hover:text-white",
              "group flex items-center px-3 py-2 text-sm font-medium rounded-[4px]"
            )}
          >
            <item.icon
              className={cn(
                isActive
                  ? "text-[#000000] dark:text-white"
                  : "text-[#6b7280] group-hover:text-[#000000] dark:text-[#98989e] dark:group-hover:text-white",
                "mr-3 flex-shrink-0 h-5 w-5"
              )}
              aria-hidden="true"
            />
            <span className="truncate">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
};