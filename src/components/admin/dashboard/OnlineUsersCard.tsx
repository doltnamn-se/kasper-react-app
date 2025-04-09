
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCustomerPresence } from "@/components/admin/customers/useCustomerPresence";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const OnlineUsersCard = () => {
  const { t } = useLanguage();
  const { onlineUsers } = useCustomerPresence();
  const [onlineCount, setOnlineCount] = useState<number>(0);
  
  useEffect(() => {
    // Get all profiles to find the admin user ID
    const fetchAdminUserId = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', 'info@doltnamn.se')
        .single();
      
      const adminId = data?.id;
      
      // Count online users excluding the admin
      let count = 0;
      if (adminId) {
        // If we found the admin ID, exclude it from the count
        count = Array.from(onlineUsers).filter(id => id !== adminId).length;
      } else {
        // Fallback to counting all users if we couldn't find the admin
        count = onlineUsers.size;
      }
      
      setOnlineCount(count);
    };
    
    fetchAdminUserId();
  }, [onlineUsers]);
  
  return (
    <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[4px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
        <CardTitle className="text-sm font-medium">
          {t('online.users')}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="text-2xl font-bold">{onlineCount}</div>
      </CardContent>
    </div>
  );
};
