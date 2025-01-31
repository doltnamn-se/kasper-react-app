import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart3,
  BookOpen,
  CheckSquare,
  Home,
  Link2,
  MapPin,
} from "lucide-react";

interface MainNavigationProps {
  toggleMobileMenu?: () => void;
}

export const MainNavigation = ({ toggleMobileMenu }: MainNavigationProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { userProfile } = useUserProfile();

  // Fetch guide completion notifications
  const { data: guideNotifications = [] } = useQuery({
    queryKey: ['guide-notifications'],
    queryFn: async () => {
      console.log('Fetching guide notifications...');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return [];

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('type', 'guide_completion')
        .eq('read', false);

      if (error) {
        console.error('Error fetching guide notifications:', error);
        return [];
      }

      console.log('Guide notifications:', data);
      return data;
    },
  });

  const handleNavigation = (path: string) => {
    navigate(path);
    if (toggleMobileMenu) {
      toggleMobileMenu();
    }
  };

  const navItems = [
    {
      label: t('nav.home'),
      path: '/',
      icon: Home,
    },
    {
      label: t('nav.checklist'),
      path: '/checklist',
      icon: CheckSquare,
    },
    {
      label: t('nav.monitoring'),
      path: '/monitoring',
      icon: BarChart3,
    },
    {
      label: t('nav.my.links'),
      path: '/my-links',
      icon: Link2,
    },
    {
      label: t('nav.address.alerts'),
      path: '/address-alerts',
      icon: MapPin,
    },
    {
      label: t('nav.guides'),
      path: '/guides',
      icon: BookOpen,
      notificationCount: guideNotifications.length,
    },
  ];

  return (
    <div className="space-y-2">
      {navItems.map((item) => (
        <div
          key={item.path}
          onClick={() => handleNavigation(item.path)}
          className={cn(
            "flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors",
            location.pathname === item.path
              ? "bg-[#f3f4f6] text-[#000000] dark:bg-[#2d2d2d] dark:text-white"
              : "text-[#000000A6] hover:text-[#000000] hover:bg-[#f3f4f6] dark:text-[#FFFFFFA6] dark:hover:text-white dark:hover:bg-[#2d2d2d]"
          )}
        >
          <div className="flex items-center gap-3">
            <item.icon className="w-4 h-4" />
            <span>{item.label}</span>
          </div>
          {item.notificationCount > 0 && (
            <div className="flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-[#2e77d0] rounded-full">
              {item.notificationCount}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};