
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

type SubscriptionCount = {
  plan: string | null;
  count: number;
}

type CustomerTypeCount = {
  type: string;
  count: number;
}

export const useAdminDashboardData = () => {
  const [totalCustomers, setTotalCustomers] = useState<number>(0);
  const [subscriptionCounts, setSubscriptionCounts] = useState<SubscriptionCount[]>([]);
  const [customerTypeCounts, setCustomerTypeCounts] = useState<CustomerTypeCount[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch total customer count by joining with profiles to exclude admin accounts
        const { count } = await supabase
          .from('customers')
          .select('id', { count: 'exact', head: true })
          .not('id', 'eq', 'info@doltnamn.se');
        
        setTotalCustomers(count || 0);

        // Fetch subscription plan distribution
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('customers')
          .select('subscription_plan, profiles:profiles!inner(role)')
          .eq('profiles.role', 'customer');

        if (subscriptionError) {
          console.error('Error fetching subscription data:', subscriptionError);
        } else {
          // Count occurrences of each subscription plan
          const planCounts: Record<string, number> = {};
          
          subscriptionData.forEach((item: any) => {
            const plan = item.subscription_plan || 'null';
            planCounts[plan] = (planCounts[plan] || 0) + 1;
          });

          // Format data for the widget
          const formattedSubscriptions = Object.entries(planCounts)
            .map(([plan, count]) => ({
              plan: plan === 'null' ? null : plan,
              count
            }));

          setSubscriptionCounts(formattedSubscriptions);
        }

        // Fetch customer type distribution
        const { data: customerTypeData, error: customerTypeError } = await supabase
          .from('customers')
          .select('customer_type, profiles:profiles!inner(role)')
          .eq('profiles.role', 'customer');

        if (customerTypeError) {
          console.error('Error fetching customer type data:', customerTypeError);
        } else {
          // Count occurrences of each customer type
          const typeCounts: Record<string, number> = {
            private: 0,
            business: 0
          };
          
          customerTypeData.forEach((item: any) => {
            const type = item.customer_type === 'business' ? 'business' : 'private';
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

  return {
    totalCustomers,
    subscriptionCounts,
    customerTypeCounts,
    isLoading,
    findSubscriptionCount,
    findCustomerTypeCount
  };
};
