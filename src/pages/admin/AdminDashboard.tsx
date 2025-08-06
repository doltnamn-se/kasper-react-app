import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAdminDashboardData } from "@/hooks/useAdminDashboardData";
import { OnlineUsersCard } from "@/components/admin/dashboard/OnlineUsersCard";
import { DashboardCard } from "@/components/admin/dashboard/DashboardCard";
import { LinkManagementCard } from "@/components/admin/dashboard/LinkManagementCard";
import { SubscriptionDistributionCard } from "@/components/admin/dashboard/SubscriptionDistributionCard";
import { ClientsOverTimeChart } from "@/components/admin/dashboard/ClientsOverTimeChart";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
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
  
  useEffect(() => {
    document.title = "Admin | Kasper";
  }, []);
  const [customersTimeRange, setCustomersTimeRange] = useState<TimeRange>('alltime');
  const [subscriptionTimeRange, setSubscriptionTimeRange] = useState<TimeRange>('alltime');
  
  const { 
    totalCustomers, 
    isLoading,
    customerRegistrationData,
    subscriptionData,
    getSubscriptionDataForType,
    fetchDashboardData,
    filterCustomerDataByTimeRange,
    filterSubscriptionDataByTimeRange
  } = useAdminDashboardData();

  // Get subscription data for total customers and filter by time range
  const totalSubscriptionData = getSubscriptionDataForType('all');
  const filteredSubscriptionData = filterSubscriptionDataByTimeRange(totalSubscriptionData, subscriptionTimeRange);
  
  // Filter chart data based on selected time range
  const filteredChartData = filterCustomerDataByTimeRange(customerRegistrationData, customersTimeRange);

  // Type-safe handler for subscription time range changes
  const handleSubscriptionTimeRangeChange = (range: TimeRange) => {
    setSubscriptionTimeRange(range);
  };


  return (
    <div className="w-full overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-[-.416px] text-[#000000] dark:text-white">
          {t('nav.admin.dashboard')}
        </h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 overflow-hidden">
        {/* Left Column */}
        <div className="flex flex-col space-y-4 w-full overflow-hidden">
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
                    {t(`timerange.${customersTimeRange}`)}
                    <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white dark:bg-[#1c1c1e] border border-[#e5e7eb] dark:border-[#232325] shadow-sm text-xs">
                  <DropdownMenuItem onClick={() => setCustomersTimeRange('alltime')} className="py-2 cursor-pointer">
                    {t('timerange.alltime')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCustomersTimeRange('ytd')} className="py-2 cursor-pointer">
                    {t('timerange.ytd')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCustomersTimeRange('mtd')} className="py-2 cursor-pointer">
                    {t('timerange.mtd')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCustomersTimeRange('1year')} className="py-2 cursor-pointer">
                    {t('timerange.1year')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCustomersTimeRange('4weeks')} className="py-2 cursor-pointer">
                    {t('timerange.4weeks')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCustomersTimeRange('1week')} className="py-2 cursor-pointer">
                    {t('timerange.1week')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            }
          />
        </div>
        
        {/* Right Column */}
        <div className="flex flex-col space-y-4 w-full overflow-hidden">
          {/* 2. Link Management Card */}
          <LinkManagementCard />

          {/* 4. Subscription Distribution Card */}
          <SubscriptionDistributionCard 
            subscriptionData={filteredSubscriptionData}
            timeRange={subscriptionTimeRange}
            onTimeRangeChange={handleSubscriptionTimeRangeChange}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
