
import { useLanguage } from "@/contexts/LanguageContext";
import { useAdminDashboardData } from "@/hooks/useAdminDashboardData";
import { OnlineUsersCard } from "@/components/admin/dashboard/OnlineUsersCard";
import { DashboardCard } from "@/components/admin/dashboard/DashboardCard";
import { LinkManagementCard } from "@/components/admin/dashboard/LinkManagementCard";
import { UsersRound, User, Briefcase } from "lucide-react";

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
        {/* Active Customers Card (1) */}
        <DashboardCard 
          title={t('total.customers')}
          value={totalCustomers}
          icon={<UsersRound className="h-4 w-4 text-[#000000A6] dark:text-[#FFFFFFA6]" />}
          subscriptionData={totalSubscriptionData}
        />
        
        {/* Online Users Card (2) */}
        <OnlineUsersCard />
        
        {/* Private Customers Card (3) */}
        <DashboardCard 
          title={t('private.customers')}
          value={privateSubscriptionData.reduce((sum, item) => sum + item.count, 0)}
          icon={<User className="h-4 w-4 text-[#000000A6] dark:text-[#FFFFFFA6]" />}
          subscriptionData={privateSubscriptionData}
        />
        
        {/* Business Customers Card (4) */}
        <DashboardCard 
          title={t('business.customers')}
          value={businessSubscriptionData.reduce((sum, item) => sum + item.count, 0)}
          icon={<Briefcase className="h-4 w-4 text-[#000000A6] dark:text-[#FFFFFFA6]" />}
          subscriptionData={businessSubscriptionData}
        />

        {/* Link Management Card (5) */}
        <LinkManagementCard />
      </div>
    </div>
  );
};

export default AdminDashboard;
