
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface SubscriptionData {
  plan: string;
  count: number;
}

interface SubscriptionDistributionCardProps {
  subscriptionData: SubscriptionData[];
}

export const SubscriptionDistributionCard = ({ subscriptionData }: SubscriptionDistributionCardProps) => {
  const { t } = useLanguage();
  
  // Format the plan name for display
  const formatPlanName = (plan: string): string => {
    // Convert plan from database format (e.g., '1_month') to UI format (e.g., '1month')
    const uiPlanKey = plan.replace('_', '');
    return t(`subscription.${uiPlanKey}` as any);
  };
  
  const total = subscriptionData.reduce((sum, item) => sum + item.count, 0);
  
  // Prepare data for the chart with percentages
  const data = subscriptionData.map((item, index) => ({
    name: formatPlanName(item.plan),
    plan: item.plan,
    value: item.count,
    percentage: ((item.count / total) * 100).toFixed(1)
  }));

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-[#1c1c1e] p-2 border border-[#e5e7eb] dark:border-[#232325] rounded shadow-sm text-xs">
          <p className="font-medium">{payload[0]?.payload.name}</p>
          <p>{`${payload[0]?.payload.percentage}% (${payload[0]?.value})`}</p>
        </div>
      );
    }
    return null;
  };

  // Create a custom label that shows plan and percentage
  const renderCustomBarLabel = (props: any) => {
    const { x, y, width, value, index } = props;
    
    // Only render label if bar is wide enough
    if (width < 30) return null;
    
    const item = data[index];
    
    return (
      <g>
        <text
          x={x + width + 5}
          y={y + 15}
          fill="#10b981"
          className="dark:fill-[#3ecf8e]"
          textAnchor="start"
          fontSize="12"
        >
          {`${item.percentage}% (${item.value})`}
        </text>
      </g>
    );
  };

  return (
    <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[4px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
        <CardTitle className="text-sm font-medium">
          {t('subscription.distribution')}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex flex-col h-[280px]">
          <div className="text-2xl font-bold">
            {total}
          </div>
          
          <div className="flex-1 mt-6">
            <ChartContainer className="h-[200px] w-full" config={{}}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data}
                  layout="vertical"
                  margin={{ top: 5, right: 90, left: 0, bottom: 5 }}
                >
                  <XAxis type="number" hide />
                  <YAxis 
                    type="category"
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                    className="dark:text-gray-400"
                    width={80}
                  />
                  <Tooltip 
                    content={<CustomTooltip />}
                    cursor={{ fill: 'transparent' }}
                  />
                  <Bar 
                    dataKey="value"
                    barSize={12}
                    radius={6}
                    label={renderCustomBarLabel}
                    className="fill-[#10b981] dark:fill-[#10b981] hover:fill-[#3fcf8e] dark:hover:fill-[#3ecf8e]"
                  >
                    {data.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`}
                        className="fill-[#10b981] dark:fill-[#10b981] hover:fill-[#3fcf8e] dark:hover:fill-[#3ecf8e]"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>
      </CardContent>
    </div>
  );
};
