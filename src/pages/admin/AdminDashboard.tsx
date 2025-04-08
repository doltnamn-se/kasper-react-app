
import { useLanguage } from "@/contexts/LanguageContext";
import { useAdminDashboardData } from "@/hooks/useAdminDashboardData";
import { CustomerTypeCards } from "@/components/admin/dashboard/CustomerTypeCards";
import { SubscriptionCards } from "@/components/admin/dashboard/SubscriptionCards";

const AdminDashboard = () => {
  const { t } = useLanguage();
  const { 
    totalCustomers, 
    isLoading,
    findSubscriptionCount, 
    findCustomerTypeCount 
  } = useAdminDashboardData();

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-[-.416px] text-[#000000] dark:text-white mb-6">
        {t('nav.admin.dashboard')}
      </h1>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Customer Type Cards */}
        <CustomerTypeCards 
          totalCustomers={totalCustomers} 
          findCustomerTypeCount={findCustomerTypeCount} 
        />

        {/* Subscription Cards - first 3 in the grid */}
        <SubscriptionCards findSubscriptionCount={findSubscriptionCount} />
        
        {/* 24 Months Subscription Card with full width */}
        <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[4px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200 md:col-span-3">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
            <div className="text-sm font-medium">
              {t('subscription.24months')}
            </div>
            <div className="h-4 w-4 text-[#000000A6] dark:text-[#FFFFFFA6]">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="16" height="16" x="4" y="4" rx="2" />
                <path d="M4 11h16" />
                <path d="M11 4v16" />
              </svg>
            </div>
          </div>
          <div className="p-0">
            <div className="text-2xl font-bold">{findSubscriptionCount('24months')}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
