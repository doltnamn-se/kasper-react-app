
import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UsersRound, CalendarDays, Users, Briefcase, User } from "lucide-react";
import { Customer } from "@/types/customer";

type SubscriptionCount = {
  plan: string | null;
  count: number;
}

type CustomerTypeCount = {
  type: string;
  count: number;
}

const AdminDashboard = () => {
  const { t } = useLanguage();
  const [totalCustomers, setTotalCustomers] = useState<number>(0);
  const [subscriptionCounts, setSubscriptionCounts] = useState<SubscriptionCount[]>([]);
  const [customerTypeCounts, setCustomerTypeCounts] = useState<CustomerTypeCount[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch total customer count, excluding admin account
        const { count } = await supabase
          .from('customers')
          .select('*', { count: 'exact', head: true })
          .neq('created_by', null); // Exclude admin account
        
        setTotalCustomers(count || 0);

        // Fetch subscription plan distribution, excluding admin account
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('customers')
          .select('subscription_plan')
          .neq('created_by', null); // Exclude admin account

        if (subscriptionError) {
          console.error('Error fetching subscription data:', subscriptionError);
        } else {
          // Count occurrences of each subscription plan
          const planCounts: Record<string, number> = {};
          
          subscriptionData.forEach((customer: Customer) => {
            const plan = customer.subscription_plan || 'null';
            planCounts[plan] = (planCounts[plan] || 0) + 1;
          });

          // Format data for the widget - exclude null (no plan) entry
          const formattedSubscriptions = Object.entries(planCounts)
            .filter(([plan]) => plan !== 'null') // Exclude null plan (admin)
            .map(([plan, count]) => ({
              plan,
              count
            }));

          setSubscriptionCounts(formattedSubscriptions);
        }

        // Fetch customer type distribution, excluding admin account
        const { data: customerTypeData, error: customerTypeError } = await supabase
          .from('customers')
          .select('customer_type')
          .neq('created_by', null); // Exclude admin account

        if (customerTypeError) {
          console.error('Error fetching customer type data:', customerTypeError);
        } else {
          // Count occurrences of each customer type
          const typeCounts: Record<string, number> = {
            private: 0,
            business: 0
          };
          
          customerTypeData.forEach((customer: { customer_type: string }) => {
            const type = customer.customer_type === 'business' ? 'business' : 'private';
            typeCounts[type] = (typeCounts[type] || 0) + 1;
          });

          // Format data for the widget
          const formattedTypes = Object.entries(typeCounts).map(([type, count]) => ({
            type,
            count
          }));

          setCustomerTypeCounts(formattedTypes);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format subscription labels for display
  const formatSubscriptionLabel = (plan: string | null) => {
    if (plan === null) return t('subscription.none');
    
    switch(plan) {
      case '1month': return t('subscription.1month');
      case '6months': return t('subscription.6months');
      case '12months': return t('subscription.12months');
      case '24months': return t('subscription.24months');
      default: return plan;
    }
  };

  // Find specific subscription count
  const findSubscriptionCount = (planName: string | null): number => {
    const plan = subscriptionCounts.find(sub => sub.plan === planName);
    return plan?.count || 0;
  };

  // Find specific customer type count
  const findCustomerTypeCount = (typeName: string): number => {
    const type = customerTypeCounts.find(t => t.type === typeName);
    return type?.count || 0;
  };

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-[-.416px] text-[#000000] dark:text-white mb-6">
        {t('nav.admin.dashboard')}
      </h1>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Total Customers Card */}
        <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[4px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
            <CardTitle className="text-sm font-medium">
              {t('total.customers')}
            </CardTitle>
            <UsersRound className="h-4 w-4 text-[#000000A6] dark:text-[#FFFFFFA6]" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-2xl font-bold">{totalCustomers}</div>
          </CardContent>
        </div>

        {/* Private Customers Card */}
        <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[4px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
            <CardTitle className="text-sm font-medium">
              Privatkunder
            </CardTitle>
            <User className="h-4 w-4 text-[#000000A6] dark:text-[#FFFFFFA6]" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-2xl font-bold">{findCustomerTypeCount('private')}</div>
          </CardContent>
        </div>

        {/* Business Customers Card */}
        <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[4px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
            <CardTitle className="text-sm font-medium">
              Företagskunder
            </CardTitle>
            <Briefcase className="h-4 w-4 text-[#000000A6] dark:text-[#FFFFFFA6]" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-2xl font-bold">{findCustomerTypeCount('business')}</div>
          </CardContent>
        </div>

        {/* 1 Month Subscription Card */}
        <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[4px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
            <CardTitle className="text-sm font-medium">
              {t('subscription.1month')}
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-[#000000A6] dark:text-[#FFFFFFA6]" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-2xl font-bold">{findSubscriptionCount('1month')}</div>
          </CardContent>
        </div>

        {/* 6 Months Subscription Card */}
        <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[4px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
            <CardTitle className="text-sm font-medium">
              {t('subscription.6months')}
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-[#000000A6] dark:text-[#FFFFFFA6]" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-2xl font-bold">{findSubscriptionCount('6months')}</div>
          </CardContent>
        </div>

        {/* 12 Months Subscription Card */}
        <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[4px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
            <CardTitle className="text-sm font-medium">
              {t('subscription.12months')}
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-[#000000A6] dark:text-[#FFFFFFA6]" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-2xl font-bold">{findSubscriptionCount('12months')}</div>
          </CardContent>
        </div>

        {/* 24 Months Subscription Card */}
        <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[4px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200 md:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
            <CardTitle className="text-sm font-medium">
              {t('subscription.24months')}
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-[#000000A6] dark:text-[#FFFFFFA6]" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-2xl font-bold">{findSubscriptionCount('24months')}</div>
          </CardContent>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
