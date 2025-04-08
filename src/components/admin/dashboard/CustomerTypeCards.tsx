
import { UsersRound, User, Briefcase } from "lucide-react";
import { DashboardCard } from "./DashboardCard";
import { useLanguage } from "@/contexts/LanguageContext";

interface CustomerTypeCardsProps {
  totalCustomers: number;
  getSubscriptionDataForType: (type: 'all' | 'private' | 'business') => Array<{plan: string, count: number}>;
}

export const CustomerTypeCards = ({ totalCustomers, getSubscriptionDataForType }: CustomerTypeCardsProps) => {
  const { t } = useLanguage();
  
  // Get subscription data for each card
  const totalSubscriptionData = getSubscriptionDataForType('all');
  const privateSubscriptionData = getSubscriptionDataForType('private');
  const businessSubscriptionData = getSubscriptionDataForType('business');
  
  return (
    <>
      <DashboardCard 
        title={t('total.customers')}
        value={totalCustomers}
        icon={<UsersRound className="h-4 w-4 text-[#000000A6] dark:text-[#FFFFFFA6]" />}
        subscriptionData={totalSubscriptionData}
      />
      
      <DashboardCard 
        title="Privatkunder"
        value={privateSubscriptionData.reduce((sum, item) => sum + item.count, 0)}
        icon={<User className="h-4 w-4 text-[#000000A6] dark:text-[#FFFFFFA6]" />}
        subscriptionData={privateSubscriptionData}
      />
      
      <DashboardCard 
        title="Företagskunder"
        value={businessSubscriptionData.reduce((sum, item) => sum + item.count, 0)}
        icon={<Briefcase className="h-4 w-4 text-[#000000A6] dark:text-[#FFFFFFA6]" />}
        subscriptionData={businessSubscriptionData}
      />
    </>
  );
};
