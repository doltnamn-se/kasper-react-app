
import { UsersRound, User, Briefcase } from "lucide-react";
import { DashboardCard } from "./DashboardCard";
import { useLanguage } from "@/contexts/LanguageContext";

interface CustomerTypeCardsProps {
  totalCustomers: number;
  findCustomerTypeCount: (typeName: string) => number;
}

export const CustomerTypeCards = ({ totalCustomers, findCustomerTypeCount }: CustomerTypeCardsProps) => {
  const { t } = useLanguage();
  
  return (
    <>
      <DashboardCard 
        title={t('total.customers')}
        value={totalCustomers}
        icon={<UsersRound className="h-4 w-4 text-[#000000A6] dark:text-[#FFFFFFA6]" />}
      />
      
      <DashboardCard 
        title="Privatkunder"
        value={findCustomerTypeCount('private')}
        icon={<User className="h-4 w-4 text-[#000000A6] dark:text-[#FFFFFFA6]" />}
      />
      
      <DashboardCard 
        title="Företagskunder"
        value={findCustomerTypeCount('business')}
        icon={<Briefcase className="h-4 w-4 text-[#000000A6] dark:text-[#FFFFFFA6]" />}
      />
    </>
  );
};
