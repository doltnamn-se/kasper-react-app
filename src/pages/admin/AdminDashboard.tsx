import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAdminDashboardData } from "@/hooks/useAdminDashboardData";
import { OnlineUsersCard } from "@/components/admin/dashboard/OnlineUsersCard";
import { DashboardCard } from "@/components/admin/dashboard/DashboardCard";
import { LinkManagementCard } from "@/components/admin/dashboard/LinkManagementCard";
import { SubscriptionDistributionCard } from "@/components/admin/dashboard/SubscriptionDistributionCard";
import { ClientsOverTimeChart } from "@/components/admin/dashboard/ClientsOverTimeChart";
import { Button } from "@/components/ui/button";
import { ChevronDown, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
  const { toast } = useToast();
  
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

  // Test Stripe connection using existing create-customer function
  const testStripeConnection = async () => {
    try {
      toast({
        title: "Testing Stripe Connection",
        description: "Testing with create-customer function...",
      });

      console.log("Testing Stripe via create-customer function...");
      
      // Call create-customer with test data to verify Stripe integration
      const { data, error } = await supabase.functions.invoke('create-customer', {
        body: {
          email: 'stripe-test@example.com',
          password: 'tempPassword123!',
          display_name: 'Stripe Test User',
          subscription_plan: '1_month',
          customer_type: 'individual',
          address_alert: false
        }
      });
      
      console.log("Create customer response:", { data, error });
      
      if (error) {
        console.error("Function error:", error);
        throw new Error(`Function error: ${error.message}`);
      }

      if (data?.user && data?.coupon_code) {
        toast({
          title: "✅ Stripe Connection Working!",
          description: `Customer created with coupon: ${data.coupon_code}`,
        });
      } else if (data?.error) {
        throw new Error(data.error);
      } else {
        toast({
          title: "⚠️ Partial Success",
          description: "Customer created but no coupon code returned - check Stripe key",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Stripe test failed:", error);
      toast({
        title: "❌ Stripe Connection Failed",
        description: `Error: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-[-.416px] text-[#000000] dark:text-white">
          {t('nav.admin.dashboard')}
        </h1>
        <Button 
          onClick={testStripeConnection}
          className="flex items-center gap-2 h-8 px-3 text-xs"
          variant="outline"
        >
          <Zap className="h-3.5 w-3.5" />
          Test Stripe
        </Button>
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
