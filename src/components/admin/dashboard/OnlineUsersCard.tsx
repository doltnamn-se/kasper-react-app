
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCustomerPresence } from "@/components/admin/customers/useCustomerPresence";
import { useEffect, useState } from "react";
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
  
  return (
    <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[4px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200 flex flex-col h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
        <CardTitle className="text-sm font-medium">
          {t('online.users')}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex flex-col flex-grow">
        <div className="text-2xl font-bold mb-12">{onlineCount}</div>
        
        <div className="space-y-3 mt-2">
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
            <div className="text-sm text-gray-500 text-[#000000a6] dark:text-[#ffffffa6] flex justify-center items-center h-full">
              {t('no.customers')}
            </div>
          )}
        </div>
      </CardContent>
    </div>
  );
};
