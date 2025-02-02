import { useUserProfile } from "@/hooks/useUserProfile";
import { DeindexingProgress } from "./DeindexingProgress";
import { ProfileSection } from "./profile/ProfileSection";
import { NavigationLinks } from "./navigation/NavigationLinks";
import { useAdminCheck } from "./hooks/useAdminCheck";
import { useUnreadNotifications } from "./hooks/useUnreadNotifications";

interface MainNavigationProps {
  toggleMobileMenu: () => void;
}

export const MainNavigation = ({ toggleMobileMenu }: MainNavigationProps) => {
  const { userProfile } = useUserProfile();
  const isAdmin = useAdminCheck();
  const {
    unreadGuideNotifications,
    unreadMonitoringNotifications,
    unreadDeindexingNotifications,
    unreadAddressAlerts
  } = useUnreadNotifications(userProfile?.id);

  if (isAdmin) {
    return null;
  }

  const unreadCounts = {
    total: 0, // Home page has no notifications
    monitoring: unreadMonitoringNotifications,
    deindexing: unreadDeindexingNotifications,
    addressAlerts: unreadAddressAlerts,
    guides: unreadGuideNotifications,
  };

  console.log('Unread notification counts:', unreadCounts);

  return (
    <>
      <ProfileSection />
      <NavigationLinks 
        unreadCounts={unreadCounts}
        toggleMobileMenu={toggleMobileMenu}
      />
      <DeindexingProgress />
    </>
  );
};