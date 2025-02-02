import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { DeindexingProgress } from "./DeindexingProgress";
import { useNotifications } from "@/hooks/useNotifications";

export const MainNavigation = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const { notifications = [] } = useNotifications();

  // Count unread deindexing notifications
  const unreadDeindexingCount = notifications.filter(
    n => !n.read && n.type === 'removal'
  ).length;

  return (
    <nav className="space-y-2">
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
          {t('nav.main')}
        </h2>
        <div className="space-y-1">
          <Link
            to="/checklist"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              "flex w-full items-center rounded-md border border-transparent px-4 py-2",
              location.pathname === "/checklist"
                ? "bg-[#f4f4f5] font-semibold dark:bg-[#27272A]"
                : "hover:bg-[#f4f4f5] dark:hover:bg-[#27272A]"
            )}
          >
            {t('nav.checklist')}
          </Link>
          
          <Link
            to="/guides"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              "flex w-full items-center rounded-md border border-transparent px-4 py-2",
              location.pathname === "/guides"
                ? "bg-[#f4f4f5] font-semibold dark:bg-[#27272A]"
                : "hover:bg-[#f4f4f5] dark:hover:bg-[#27272A]"
            )}
          >
            {t('nav.guides')}
          </Link>

          <div className="relative">
            <Link
              to="/my-links"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                "flex w-full items-center rounded-md border border-transparent px-4 py-2",
                location.pathname === "/my-links"
                  ? "bg-[#f4f4f5] font-semibold dark:bg-[#27272A]"
                  : "hover:bg-[#f4f4f5] dark:hover:bg-[#27272A]"
              )}
            >
              {t('nav.my.links')}
              {unreadDeindexingCount > 0 && (
                <span className="ml-2 h-2 w-2 rounded-full bg-[#2e77d0]" />
              )}
            </Link>
            <DeindexingProgress />
          </div>

          <Link
            to="/address-alerts"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              "flex w-full items-center rounded-md border border-transparent px-4 py-2",
              location.pathname === "/address-alerts"
                ? "bg-[#f4f4f5] font-semibold dark:bg-[#27272A]"
                : "hover:bg-[#f4f4f5] dark:hover:bg-[#27272A]"
            )}
          >
            {t('nav.address.alerts')}
          </Link>
        </div>
      </div>
    </nav>
  );
};