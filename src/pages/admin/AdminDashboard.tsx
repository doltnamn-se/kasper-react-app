
import { useLanguage } from "@/contexts/LanguageContext";
import { useAdminDashboardData } from "@/hooks/useAdminDashboardData";
import { OnlineUsersCard } from "@/components/admin/dashboard/OnlineUsersCard";
import { DashboardCard } from "@/components/admin/dashboard/DashboardCard";
import { LinkManagementCard } from "@/components/admin/dashboard/LinkManagementCard";
import { SubscriptionDistributionCard } from "@/components/admin/dashboard/SubscriptionDistributionCard";
import { ClientsOverTimeChart } from "@/components/admin/dashboard/ClientsOverTimeChart";

const AdminDashboard = () => {
  const { t } = useLanguage();
  const { 
    totalCustomers, 
    isLoading,
    customerRegistrationData,
    getSubscriptionDataForType 
  } = useAdminDashboardData();

  // Get subscription data for total customers
  const totalSubscriptionData = getSubscriptionDataForType('all');

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-[-.416px] text-[#000000] dark:text-white mb-6">
        {t('nav.admin.dashboard')}
      </h1>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Active Customers Card - No subscription breakdown but with chart */}
        <DashboardCard 
          title={t('total.customers')}
          value={totalCustomers}
          subscriptionData={totalSubscriptionData}
          showSubscriptionBreakdown={false}
          chart={<ClientsOverTimeChart data={customerRegistrationData} />}
        />
        
        {/* Subscription Distribution Card */}
        <SubscriptionDistributionCard 
          subscriptionData={totalSubscriptionData}
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
