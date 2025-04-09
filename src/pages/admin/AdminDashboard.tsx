
import { useLanguage } from "@/contexts/LanguageContext";
import { useAdminDashboardData } from "@/hooks/useAdminDashboardData";
import { OnlineUsersCard } from "@/components/admin/dashboard/OnlineUsersCard";
import { DashboardCard } from "@/components/admin/dashboard/DashboardCard";
import { LinkManagementCard } from "@/components/admin/dashboard/LinkManagementCard";
import { SubscriptionDistributionCard } from "@/components/admin/dashboard/SubscriptionDistributionCard";

const AdminDashboard = () => {
  const { t } = useLanguage();
  const { 
    totalCustomers, 
    isLoading,
    getSubscriptionDataForType 
  } = useAdminDashboardData();

  // Get subscription data for each card
  const totalSubscriptionData = getSubscriptionDataForType('all');
  const privateSubscriptionData = getSubscriptionDataForType('private');
  const businessSubscriptionData = getSubscriptionDataForType('business');

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-[-.416px] text-[#000000] dark:text-white mb-6">
        {t('nav.admin.dashboard')}
      </h1>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Active Customers Card */}
        <DashboardCard 
          title={t('total.customers')}
          value={totalCustomers}
          subscriptionData={totalSubscriptionData}
        />
        
        {/* Subscription Distribution Card */}
        <SubscriptionDistributionCard 
          subscriptionData={totalSubscriptionData}
        />
        
        {/* Private Customers Card */}
        <DashboardCard 
          title={t('private.customers')}
          value={privateSubscriptionData.reduce((sum, item) => sum + item.count, 0)}
          subscriptionData={privateSubscriptionData}
        />
        
        {/* Business Customers Card */}
        <DashboardCard 
          title={t('business.customers')}
          value={businessSubscriptionData.reduce((sum, item) => sum + item.count, 0)}
          subscriptionData={businessSubscriptionData}
        />

        {/* Online Users Card */}
        <OnlineUsersCard />

        {/* Link Management Card */}
        <LinkManagementCard />
      </div>
    </div>
  );
};

export default AdminDashboard;
