
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell } from "recharts";
import { Tooltip } from "@/components/ui/tooltip";

interface SubscriptionData {
  plan: string;
  count: number;
}

interface SubscriptionDistributionCardProps {
  subscriptionData: SubscriptionData[];
}

export const SubscriptionDistributionCard = ({ subscriptionData }: SubscriptionDistributionCardProps) => {
  const { t } = useLanguage();
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  
  // Format the plan name for display
  const formatPlanName = (plan: string): string => {
    // Convert plan from database format (e.g., '1_month') to UI format (e.g., '1month')
    const uiPlanKey = plan.replace('_', '');
    return t(`subscription.${uiPlanKey}` as any);
  };
  
  const data = subscriptionData.map(item => ({
    name: formatPlanName(item.plan),
    value: item.count
  }));

  const total = subscriptionData.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[4px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
        <CardTitle className="text-sm font-medium">
          {t('subscription.distribution')}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex flex-col h-[280px]">
          {/* Chart container with proper spacing and position */}
          <div className="flex-1 flex items-center justify-center py-4">
            <div className="w-full max-w-[220px] mx-auto">
              <ChartContainer className="h-[160px] w-full" config={{}}>
                <PieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                  >
                    {data.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            </div>
          </div>
          
          {/* Data grid with fixed position at the bottom */}
          <div className="grid grid-cols-2 gap-4 mt-auto text-sm">
            {subscriptionData.map((item) => (
              <div key={item.plan} className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">
                  {formatPlanName(item.plan)}:
                </span>
                <span>{((item.count / total) * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </div>
  );
};
