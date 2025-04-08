
import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UsersRound, CalendarDays, Users } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
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

  const subscriptionColors = {
    "1month": "#4f46e5", // Indigo
    "6months": "#8b5cf6", // Purple
    "12months": "#ec4899", // Pink
    "24months": "#f43f5e", // Rose
    "null": "#94a3b8", // Slate (for no subscription)
  };

  const customerTypeColors = {
    "private": "#0ea5e9", // Sky blue for private customers
    "business": "#f59e0b", // Amber for business customers
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch total customer count
        const { count } = await supabase
          .from('customers')
          .select('*', { count: 'exact', head: true });
        
        setTotalCustomers(count || 0);

        // Fetch subscription plan distribution
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('customers')
          .select('subscription_plan');

        if (subscriptionError) {
          console.error('Error fetching subscription data:', subscriptionError);
        } else {
          // Count occurrences of each subscription plan
          const planCounts: Record<string, number> = {};
          
          subscriptionData.forEach((customer: Customer) => {
            const plan = customer.subscription_plan || 'null';
            planCounts[plan] = (planCounts[plan] || 0) + 1;
          });

          // Format data for the chart
          const formattedSubscriptions = Object.entries(planCounts).map(([plan, count]) => ({
            plan: plan === 'null' ? null : plan,
            count
          }));

          setSubscriptionCounts(formattedSubscriptions);
        }

        // Fetch customer type distribution
        const { data: customerTypeData, error: customerTypeError } = await supabase
          .from('customers')
          .select('customer_type');

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

          // Format data for the chart
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

  // Format customer type labels
  const formatCustomerTypeLabel = (type: string) => {
    return type === 'private' ? 'Privatkund' : 'Företagskund';
  };

  // Custom tooltip formatter for subscription chart
  const subscriptionTooltipFormatter = (value: number, name: string, props: any) => {
    const plan = props.payload.plan;
    return [value, formatSubscriptionLabel(plan)];
  };

  // Configuration for subscription chart
  const subscriptionChartConfig = {
    "1month": { label: t('subscription.1month'), color: subscriptionColors["1month"] },
    "6months": { label: t('subscription.6months'), color: subscriptionColors["6months"] },
    "12months": { label: t('subscription.12months'), color: subscriptionColors["12months"] },
    "24months": { label: t('subscription.24months'), color: subscriptionColors["24months"] },
    "null": { label: t('subscription.none'), color: subscriptionColors["null"] },
  };

  // Configuration for customer type chart
  const customerTypeChartConfig = {
    "private": { label: "Privatkund", color: customerTypeColors["private"] },
    "business": { label: "Företagskund", color: customerTypeColors["business"] },
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

        {/* Subscription Plans Distribution Card */}
        <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[4px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200 md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
            <CardTitle className="text-sm font-medium">
              Subscription Plans
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-[#000000A6] dark:text-[#FFFFFFA6]" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[200px] w-full">
              {!isLoading && subscriptionCounts.length > 0 ? (
                <ChartContainer 
                  config={subscriptionChartConfig} 
                  className="h-full w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={subscriptionCounts}
                        dataKey="count"
                        nameKey="plan"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        labelLine={false}
                      >
                        {subscriptionCounts.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={subscriptionColors[entry.plan as keyof typeof subscriptionColors] || '#94a3b8'} 
                          />
                        ))}
                      </Pie>
                      <ChartTooltip 
                        formatter={subscriptionTooltipFormatter}
                        content={({ active, payload }) => {
                          if (!active || !payload || payload.length === 0) return null;
                          const data = payload[0].payload;
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-md">
                              <div className="flex flex-col">
                                <span className="font-medium">{formatSubscriptionLabel(data.plan)}</span>
                                <span className="text-sm">{data.count} customers</span>
                              </div>
                            </div>
                          );
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <ChartLegend>
                    <ChartLegendContent 
                      className="flex flex-wrap justify-center gap-4 pt-4"
                    />
                  </ChartLegend>
                </ChartContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">Loading subscription data...</p>
                </div>
              )}
            </div>
          </CardContent>
        </div>

        {/* Customer Type Distribution Card */}
        <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[4px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200 md:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
            <CardTitle className="text-sm font-medium">
              Customer Types
            </CardTitle>
            <Users className="h-4 w-4 text-[#000000A6] dark:text-[#FFFFFFA6]" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[200px] w-full">
              {!isLoading && customerTypeCounts.length > 0 ? (
                <ChartContainer 
                  config={customerTypeChartConfig} 
                  className="h-full w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={customerTypeCounts}
                        dataKey="count"
                        nameKey="type"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        labelLine={false}
                      >
                        {customerTypeCounts.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={customerTypeColors[entry.type as keyof typeof customerTypeColors]} 
                          />
                        ))}
                      </Pie>
                      <ChartTooltip 
                        content={({ active, payload }) => {
                          if (!active || !payload || payload.length === 0) return null;
                          const data = payload[0].payload;
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-md">
                              <div className="flex flex-col">
                                <span className="font-medium">{formatCustomerTypeLabel(data.type)}</span>
                                <span className="text-sm">{data.count} customers</span>
                              </div>
                            </div>
                          );
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <ChartLegend>
                    <ChartLegendContent 
                      className="flex flex-wrap justify-center gap-4 pt-4"
                    />
                  </ChartLegend>
                </ChartContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">Loading customer type data...</p>
                </div>
              )}
            </div>
          </CardContent>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
