
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, ResponsiveContainer } from "recharts";

interface SubscriptionData {
  plan: string;
  count: number;
}

interface SubscriptionDistributionCardProps {
  subscriptionData: SubscriptionData[];
}

export const SubscriptionDistributionCard = ({ subscriptionData }: SubscriptionDistributionCardProps) => {
  const { t } = useLanguage();
  
  const COLORS = ['#9b87f5', '#33C3F0', '#F97316', '#D946EF'];
  
  // Format the plan name for display
  const formatPlanName = (plan: string): string => {
    // Convert plan from database format (e.g., '1_month') to UI format (e.g., '1month')
    const uiPlanKey = plan.replace('_', '');
    return t(`subscription.${uiPlanKey}` as any);
  };
  
  const total = subscriptionData.reduce((sum, item) => sum + item.count, 0);
  
  const data = subscriptionData.map((item, index) => ({
    name: formatPlanName(item.plan),
    value: item.count,
    percentage: ((item.count / total) * 100).toFixed(1),
    color: COLORS[index % COLORS.length]
  }));

  return (
    <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[4px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
        <CardTitle className="text-sm font-medium">
          {t('subscription.distribution')}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex flex-col h-[280px]">
          <div className="text-2xl font-bold mb-8">
            {total}
          </div>
          
          <div className="flex-1 w-full">
            <ChartContainer className="h-[200px] w-full" config={{}}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 120, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis 
                    type="number" 
                    domain={[0, 'dataMax']} 
                    tickFormatter={(value) => `${value}`}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={100}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent />} 
                    formatter={(value, name) => [`${value} (${data.find(item => item.name === name)?.percentage}%)`, name]}
                  />
                  <Bar 
                    dataKey="value" 
                    barSize={30} 
                    radius={[0, 4, 4, 0]}
                    label={(props) => {
                      const { x, y, width, height, value, index } = props;
                      const percentage = data[index].percentage;
                      return (
                        <text 
                          x={x + width + 5} 
                          y={y + height / 2} 
                          fill={data[index].color}
                          textAnchor="start" 
                          dominantBaseline="middle"
                          fontSize="12"
                        >
                          {value} ({percentage}%)
                        </text>
                      );
                    }}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
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
