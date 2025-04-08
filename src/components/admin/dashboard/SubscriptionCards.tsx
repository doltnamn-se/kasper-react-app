
import { CalendarDays } from "lucide-react";
import { DashboardCard } from "./DashboardCard";
import { useLanguage } from "@/contexts/LanguageContext";

interface SubscriptionCardsProps {
  findSubscriptionCount: (planName: string | null) => number;
}

export const SubscriptionCards = ({ findSubscriptionCount }: SubscriptionCardsProps) => {
  const { t } = useLanguage();
  
  return (
    <>
      <DashboardCard 
        title={t('subscription.1month')}
        value={findSubscriptionCount('1month')}
        icon={<CalendarDays className="h-4 w-4 text-[#000000A6] dark:text-[#FFFFFFA6]" />}
      />
      
      <DashboardCard 
        title={t('subscription.6months')}
        value={findSubscriptionCount('6months')}
        icon={<CalendarDays className="h-4 w-4 text-[#000000A6] dark:text-[#FFFFFFA6]" />}
      />
      
      <DashboardCard 
        title={t('subscription.12months')}
        value={findSubscriptionCount('12months')}
        icon={<CalendarDays className="h-4 w-4 text-[#000000A6] dark:text-[#FFFFFFA6]" />}
      />
      
      <DashboardCard 
        title={t('subscription.24months')}
        value={findSubscriptionCount('24months')}
        icon={<CalendarDays className="h-4 w-4 text-[#000000A6] dark:text-[#FFFFFFA6]" />}
        // Note: The class for this component was md:col-span-3 in the original, but we'll need to handle it differently
      />
    </>
  );
};
