import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCustomerPresence } from "@/components/admin/customers/useCustomerPresence";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { getUserInitials } from "@/utils/profileUtils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type OnlineUserInfo = {
  id: string;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
};

export const OnlineUsersCard = () => {
  const { t } = useLanguage();
  const { onlineUsers } = useCustomerPresence();
  const [onlineCount, setOnlineCount] = useState<number>(0);
  const [onlineUsersList, setOnlineUsersList] = useState<OnlineUserInfo[]>([]);
  const [showTopFade, setShowTopFade] = useState(false);
  const [showBottomFade, setShowBottomFade] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const fetchOnlineUsersData = async () => {
      const { data: adminData } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', 'info@doltnamn.se')
        .maybeSingle();
      
      const adminId = adminData?.id;
      
      const onlineUserIds = Array.from(onlineUsers).filter(id => id !== adminId);
      
      setOnlineCount(onlineUserIds.length);
      
      if (onlineUserIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, display_name, email, avatar_url')
          .in('id', onlineUserIds);
        
        if (profilesData) {
          setOnlineUsersList(profilesData);
        }
      } else {
        setOnlineUsersList([]);
      }
    };
    
    fetchOnlineUsersData();
  }, [onlineUsers]);

  // Check scroll position to show/hide fade indicators
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    
    // Show top fade if scrolled down
    setShowTopFade(scrollTop > 10);
    
    // Show bottom fade if not at bottom
    setShowBottomFade(scrollTop < scrollHeight - clientHeight - 10);
  };

  // Update fade indicators when list changes
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Initial check
    handleScroll();

    // Add scroll listener
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [onlineUsersList]);
  
  return (
    <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-2xl shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
        <CardTitle className="text-sm font-medium">
          {t('online.users')}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="text-2xl font-bold mb-12">{onlineCount}</div>
        
        <div className="relative">
          {/* Top fade indicator */}
          {showTopFade && (
            <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white dark:from-[#1c1c1e] to-transparent pointer-events-none z-10" />
          )}

          {/* Scrollable container with fixed height to match LinkManagementCard */}
          <div 
            ref={scrollContainerRef}
            className="space-y-3 mt-2 overflow-y-auto online-users-scroll pr-2"
            style={{ 
              maxHeight: '118px' // Matches the natural height of LinkManagementCard's 2x2 grid
            }}
          >
            {onlineUsersList.map(user => (
              <div key={user.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-7 w-7">
                    {user.avatar_url ? (
                      <AvatarImage src={user.avatar_url} alt={user.display_name || user.email || ''} />
                    ) : (
                      <AvatarFallback className="text-xs">
                        {getUserInitials({ 
                          display_name: user.display_name, 
                          email: user.email 
                        })}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span className="text-sm font-medium truncate max-w-[150px]">
                    {user.display_name || user.email || t('no.name')}
                  </span>
                </div>
                <div className="flex items-center">
                  <Badge 
                    className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-0 px-2 py-0.5 hover:bg-green-100 dark:hover:bg-green-900/30"
                  >
                    <span className="text-xs">{t('online')}</span>
                  </Badge>
                </div>
              </div>
            ))}
            
            {onlineUsersList.length === 0 && onlineCount === 0 && (
              <div className="text-sm text-gray-500 text-[#000000a6] dark:text-[#ffffffa6]">
                {t('no.customers')}
              </div>
            )}
          </div>

          {/* Bottom fade indicator */}
          {showBottomFade && (
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white dark:from-[#1c1c1e] to-transparent pointer-events-none z-10" />
          )}
        </div>
      </CardContent>
    </div>
  );
};
