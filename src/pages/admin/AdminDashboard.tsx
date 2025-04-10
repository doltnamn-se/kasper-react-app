
import { useLanguage } from "@/contexts/LanguageContext";
import { useAdminDashboardData } from "@/hooks/useAdminDashboardData";
import { OnlineUsersCard } from "@/components/admin/dashboard/OnlineUsersCard";
import { DashboardCard } from "@/components/admin/dashboard/DashboardCard";
import { LinkManagementCard } from "@/components/admin/dashboard/LinkManagementCard";
import { SubscriptionDistributionCard } from "@/components/admin/dashboard/SubscriptionDistributionCard";
import { ClientsOverTimeChart } from "@/components/admin/dashboard/ClientsOverTimeChart";
import { CreateCustomerDialog } from "@/components/admin/CreateCustomerDialog";
import { Button } from "@/components/ui/button";
import { UserRoundPlus } from "lucide-react";

const AdminDashboard = () => {
  const { t } = useLanguage();
  const { 
    totalCustomers, 
    isLoading,
    customerRegistrationData,
    getSubscriptionDataForType,
    fetchDashboardData
  } = useAdminDashboardData();

  // Get subscription data for total customers
  const totalSubscriptionData = getSubscriptionDataForType('all');

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-[-.416px] text-[#000000] dark:text-white">
          {t('nav.admin.dashboard')}
        </h1>
        
        <CreateCustomerDialog onCustomerCreated={fetchDashboardData}>
          <Button 
            className="
              text-[#000000] bg-[#72e3ad] border-[#16b674bf] hover:bg-[#3fcf8ecc] hover:border-[#097c4f]
              dark:text-white dark:bg-[#3ecf8e80] dark:border-[#3ecf8e] dark:hover:bg-[#3ecf8e80] dark:hover:border-[#3ecf8e]
              border flex items-center gap-2
            "
          >
            <UserRoundPlus className="h-4 w-4 text-[#16b674bf] dark:text-[#3ecf8e]" />
            {t('add.customer')}
          </Button>
        </CreateCustomerDialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Left Column */}
        <div className="flex flex-col space-y-4">
          {/* Active Customers Card - with chart */}
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
        </div>
        
        {/* Right Column */}
        <div className="flex flex-col space-y-4">
          {/* Online Users Card */}
          <OnlineUsersCard />

          {/* Link Management Card */}
          <LinkManagementCard />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
