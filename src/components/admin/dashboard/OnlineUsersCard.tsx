
import { UsersRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCustomerPresence } from "@/components/admin/customers/useCustomerPresence";
import { useEffect, useState } from "react";

export const OnlineUsersCard = () => {
  const { t } = useLanguage();
  const { onlineUsers } = useCustomerPresence();
  const [onlineCount, setOnlineCount] = useState<number>(0);
  
  useEffect(() => {
    setOnlineCount(onlineUsers.size);
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
