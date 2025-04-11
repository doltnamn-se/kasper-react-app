
import { useLanguage } from "@/contexts/LanguageContext";
import { useAdminDashboardData } from "@/hooks/useAdminDashboardData";
import { OnlineUsersCard } from "@/components/admin/dashboard/OnlineUsersCard";
import { DashboardCard } from "@/components/admin/dashboard/DashboardCard";
import { LinkManagementCard } from "@/components/admin/dashboard/LinkManagementCard";
import { SubscriptionDistributionCard } from "@/components/admin/dashboard/SubscriptionDistributionCard";
import { ClientsOverTimeChart } from "@/components/admin/dashboard/ClientsOverTimeChart";
import { CreateCustomerDialog } from "@/components/admin/CreateCustomerDialog";
import { Button } from "@/components/ui/button";
import { UserRoundPlus, ChevronDown } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Time range options
type TimeRange = 'alltime' | 'ytd' | 'mtd' | '1year' | '4weeks' | '1week';

const AdminDashboard = () => {
  const { t } = useLanguage();
  const [timeRange, setTimeRange] = useState<TimeRange>('alltime');
  
  const { 
    totalCustomers, 
    isLoading,
    customerRegistrationData,
    getSubscriptionDataForType,
    fetchDashboardData,
    filterCustomerDataByTimeRange
  } = useAdminDashboardData();

  // Get subscription data for total customers
  const totalSubscriptionData = getSubscriptionDataForType('all');
  
  // Filter chart data based on selected time range
  const filteredChartData = filterCustomerDataByTimeRange(customerRegistrationData, timeRange);

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
              dark:text-white dark:bg-[#006239] dark:border-[#3ecf8e4d] dark:hover:bg-[#3ecf8e80] dark:hover:border-[#3ecf8e]
              border flex items-center gap-2 text-xs rounded-md h-8 px-[0.625rem]
            "
          >
            <UserRoundPlus className="[&.lucide]:h-3.5 [&.lucide]:w-3.5 text-[#097c4f] dark:text-[#85e0ba]" />
            {t('add.customer')}
          </Button>
        </CreateCustomerDialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Left Column */}
        <div className="flex flex-col space-y-4">
          {/* 1. Online Users Card */}
          <OnlineUsersCard />
          
          {/* 3. Active Customers Card - with chart */}
          <DashboardCard 
            title={t('total.customers')}
            value={totalCustomers}
            subscriptionData={totalSubscriptionData}
            showSubscriptionBreakdown={false}
            chart={<ClientsOverTimeChart data={filteredChartData} />}
            actionButton={
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="h-8 border border-[#e5e7eb] dark:border-[#232325] text-xs px-3 flex items-center gap-1"
                  >
                    {t(`timerange.${timeRange}`)}
                    <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white dark:bg-[#1c1c1e] border border-[#e5e7eb] dark:border-[#232325] shadow-sm text-xs">
                  <DropdownMenuItem onClick={() => setTimeRange('alltime')} className="py-2 cursor-pointer">
                    {t('timerange.alltime')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTimeRange('ytd')} className="py-2 cursor-pointer">
                    {t('timerange.ytd')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTimeRange('mtd')} className="py-2 cursor-pointer">
                    {t('timerange.mtd')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTimeRange('1year')} className="py-2 cursor-pointer">
                    {t('timerange.1year')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTimeRange('4weeks')} className="py-2 cursor-pointer">
                    {t('timerange.4weeks')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTimeRange('1week')} className="py-2 cursor-pointer">
                    {t('timerange.1week')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            }
          />
        </div>
        
        {/* Right Column */}
        <div className="flex flex-col space-y-4">
          {/* 2. Link Management Card */}
          <LinkManagementCard />

          {/* 4. Subscription Distribution Card */}
          <SubscriptionDistributionCard 
            subscriptionData={totalSubscriptionData}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
