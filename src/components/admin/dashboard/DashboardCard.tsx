
import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

interface SubscriptionData {
  plan: string;
  count: number;
}

interface DashboardCardProps {
  title: string;
  value: number | string;
  icon?: ReactNode;
  subscriptionData?: SubscriptionData[];
  showSubscriptionBreakdown?: boolean;
}

export const DashboardCard = ({ 
  title, 
  value, 
  icon, 
  subscriptionData,
  showSubscriptionBreakdown = false 
}: DashboardCardProps) => {
  const { t } = useLanguage();
  
  const formatPlanName = (plan: string) => {
    switch (plan) {
      case '1_month': return t('subscription.period.1month');
      case '6_months': return t('subscription.period.6months');
      case '12_months': return t('subscription.period.12months');
      case '24_months': return t('subscription.period.24months');
      default: return `${plan}:`;
    }
  };

  return (
    <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[4px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="text-2xl font-bold mb-4">{value}</div>
        
        {showSubscriptionBreakdown && subscriptionData && subscriptionData.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
            {subscriptionData.map((item) => (
              <div key={item.plan} className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">{formatPlanName(item.plan)}</span>
                <span>{item.count}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </div>
  );
};
