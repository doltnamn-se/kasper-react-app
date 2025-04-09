
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, Label, Sector } from "recharts";
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
  
  const total = subscriptionData.reduce((sum, item) => sum + item.count, 0);
  
  const data = subscriptionData.map((item, index) => ({
    name: formatPlanName(item.plan),
    plan: item.plan,
    value: item.count,
    percentage: ((item.count / total) * 100).toFixed(1),
    color: COLORS[index % COLORS.length]
  }));

  // Custom rendering component for the active sector
  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 6}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    );
  };

  // Calculate the proper position for each label
  const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, name, value, fill, percent }: any) => {
    const RADIAN = Math.PI / 180;
    // Position labels further away from the chart
    const radius = outerRadius * 1.4;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    // Position text anchors based on which side of the chart they're on
    const textAnchor = x > cx ? 'start' : 'end';
    
    return (
      <g>
        <text 
          x={x} 
          y={y - 10} 
          fill={fill} 
          textAnchor={textAnchor} 
          dominantBaseline="central"
          fontSize="12"
          fontWeight="bold"
        >
          {name}
        </text>
        <text 
          x={x} 
          y={y + 10} 
          fill={fill} 
          textAnchor={textAnchor} 
          dominantBaseline="central"
          fontSize="12"
        >
          {`${(percent * 100).toFixed(1)}% (${value})`}
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
          
          {/* Chart container with centered positioning */}
          <div className="flex-1 flex items-center justify-center">
            <ChartContainer className="h-[220px] w-full" config={{}}>
              <PieChart width={500} height={220}>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  label={renderCustomizedLabel}
                  labelLine={false}
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                    />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </div>
        </div>
      </CardContent>
    </div>
  );
};
