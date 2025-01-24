import { Link, useLocation } from "react-router-dom";
import { House, BadgeCheck, QrCode, MapPinHouse, MousePointerClick } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNotifications } from "@/hooks/useNotifications";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

interface MainNavigationProps {
  toggleMobileMenu: () => void;
}

export const MainNavigation = ({ toggleMobileMenu }: MainNavigationProps) => {
  const location = useLocation();
  const { t } = useLanguage();
  const [isAdmin, setIsAdmin] = useState(false);
  const { notifications = [] } = useNotifications();

  // Fetch checklist data for generating checklist notifications
  const { data: checklistProgress } = useQuery({
    queryKey: ['checklist-progress-notifications'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return null;

      const { data, error } = await supabase
        .from('customer_checklist_progress')
        .select('*')
        .eq('customer_id', session.user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching checklist progress:', error);
        return null;
      }

      return data;
    }
  });

  const { data: checklistItems = [] } = useQuery({
    queryKey: ['checklist-items-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('checklist_items')
        .select('*')
        .order('order_index');

      if (error) {
        console.error('Error fetching checklist items:', error);
        return [];
      }

      return data;
    }
  });

  // Get unread notifications count for each section
  const getUnreadCount = (path: string) => {
    // Remove the leading slash and map paths to notification types
    const typeMap: { [key: string]: string } = {
      'checklist': 'checklist',
      'my-links': 'links',
      'address-alerts': 'address',
      'guides': 'guide'
    };
    
    const type = typeMap[path.replace('/', '')];
    if (!type) return 0;
    
    // Count regular notifications
    const regularNotificationsCount = notifications.filter(n => !n.read && n.type === type).length;

    // For checklist, also include incomplete checklist items
    if (type === 'checklist') {
      const incompleteChecklistItems = checklistItems.filter((item, index) => {
        if (!checklistProgress) return true;
        
        let isCompleted = false;
        switch (index) {
          case 0:
            isCompleted = checklistProgress.password_updated || false;
            break;
          case 1:
            isCompleted = (checklistProgress.selected_sites?.length || 0) > 0;
            break;
          case 2:
            isCompleted = (checklistProgress.removal_urls?.length || 0) > 0;
            break;
          case 3:
            isCompleted = !!(checklistProgress.address && checklistProgress.personal_number);
            break;
        }
        return !isCompleted;
      }).length;

      return regularNotificationsCount + incompleteChecklistItems;
    }

    return regularNotificationsCount;
  };

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email === 'info@doltnamn.se') {
        setIsAdmin(true);
      }
    };

    checkAdminStatus();
  }, []);

  if (isAdmin) {
    return null;
  }

  const renderNavLink = (path: string, icon: React.ReactNode, label: string) => {
    const unreadCount = getUnreadCount(path);
    const isActive = location.pathname === path;
    
    return (
      <Link 
        to={path} 
        className={`flex items-center justify-between gap-3 mb-3 px-5 py-2.5 rounded-md ${
          isActive 
            ? "bg-gray-100 dark:bg-[#2d2d2d]" 
            : "hover:bg-gray-100 dark:hover:bg-[#2d2d2d]"
        }`}
        onClick={toggleMobileMenu}
      >
        <div className="flex items-center gap-3">
          <span className="text-black dark:text-gray-300">{icon}</span>
          <span className="text-sm text-[#1A1F2C] dark:text-slate-200 font-normal">{label}</span>
        </div>
        {unreadCount > 0 && (
          <Badge 
            className="h-5 w-6 p-0 pr-0.5 flex items-center justify-center text-xs leading-none bg-[#2e77d0] text-white font-medium border-0 hover:bg-[#2e77d0]"
          >
            {unreadCount}
          </Badge>
        )}
      </Link>
    );
  };

  return (
    <>
      {renderNavLink("/", <House className="w-[18px] h-[18px]" />, t('nav.home'))}
      {renderNavLink("/checklist", <BadgeCheck className="w-[18px] h-[18px]" />, t('nav.checklist'))}
      {renderNavLink("/my-links", <QrCode className="w-[18px] h-[18px]" />, t('nav.my.links'))}
      {renderNavLink("/address-alerts", <MapPinHouse className="w-[18px] h-[18px]" />, t('nav.address.alerts'))}
      {renderNavLink("/guides", <MousePointerClick className="w-[18px] h-[18px]" />, t('nav.guides'))}
    </>
  );
};
