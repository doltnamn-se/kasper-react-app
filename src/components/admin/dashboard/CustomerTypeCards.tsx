
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
  
  const privateCustomerCount = privateSubscriptionData.reduce((sum, item) => sum + item.count, 0);
  const businessCustomerCount = businessSubscriptionData.reduce((sum, item) => sum + item.count, 0);
  
  return (
    <DashboardCard title={t('customer.statistics')}>
      <div className="space-y-6">
        <div>
          <h3 className="text-base font-semibold mb-2">{t('total.customers')}: {totalCustomers}</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {totalSubscriptionData.map((item) => (
              <div key={item.plan} className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">
                  {item.plan === '1_month' ? '1 month:' : 
                   item.plan === '6_months' ? '6 months:' : 
                   item.plan === '12_months' ? '12 months:' : 
                   item.plan === '24_months' ? '24 months:' : `${item.plan}:`}
                </span>
                <span>{item.count}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-base font-semibold mb-2">Privatkunder: {privateCustomerCount}</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {privateSubscriptionData.map((item) => (
              <div key={item.plan} className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">
                  {item.plan === '1_month' ? '1 month:' : 
                   item.plan === '6_months' ? '6 months:' : 
                   item.plan === '12_months' ? '12 months:' : 
                   item.plan === '24_months' ? '24 months:' : `${item.plan}:`}
                </span>
                <span>{item.count}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-base font-semibold mb-2">Företagskunder: {businessCustomerCount}</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {businessSubscriptionData.map((item) => (
              <div key={item.plan} className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">
                  {item.plan === '1_month' ? '1 month:' : 
                   item.plan === '6_months' ? '6 months:' : 
                   item.plan === '12_months' ? '12 months:' : 
                   item.plan === '24_months' ? '24 months:' : `${item.plan}:`}
                </span>
                <span>{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardCard>
  );
};
