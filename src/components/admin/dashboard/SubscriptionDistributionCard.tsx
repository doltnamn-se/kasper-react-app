
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

  // Custom rendering component for the labels
  const renderCustomizedLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, plan, percentage, color } = props;
    
    // Calculate position for labels - using proper math to position them correctly
    const RADIAN = Math.PI / 180;
    // Increase radius to move labels further from the chart
    const radius = outerRadius * 1.3;
    // Use midAngle to place each label at the middle of its segment
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    // Get formatted plan name
    const planName = formatPlanName(plan);
    
    return (
      <g>
        <text 
          x={x} 
          y={y-8} 
          fill={color}
          textAnchor={x > cx ? 'start' : 'end'} 
          dominantBaseline="central"
          fontSize="12"
          fontWeight="bold"
        >
          {planName}
        </text>
        <text 
          x={x} 
          y={y+8} 
          fill={color}
          textAnchor={x > cx ? 'start' : 'end'} 
          dominantBaseline="central"
          fontSize="12"
        >
          {percentage}%
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
          <div className="text-2xl font-bold mb-4">
            {total}
          </div>
          
          {/* Chart container, reduced top margin and centered */}
          <div className="flex-1 flex items-center justify-center">
            <ChartContainer className="h-[220px] w-full" config={{}}>
              <PieChart width={500} height={200}>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  labelLine={false}
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                    />
                  ))}
                </Pie>
                {/* Render labels with carefully calculated positions based on segment angles */}
                {data.map((entry, index) => {
                  // Calculate proper angle distribution based on data values
                  const angleOffset = data.reduce((acc, item, i) => {
                    if (i < index) {
                      return acc + (item.value / total) * 360;
                    }
                    return acc;
                  }, 0);
                  
                  const segmentAngle = (entry.value / total) * 360;
                  const midAngle = angleOffset + (segmentAngle / 2);
                  
                  return renderCustomizedLabel({
                    cx: "50%",
                    cy: "50%",
                    midAngle: midAngle,
                    innerRadius: 40,
                    outerRadius: 70,
                    plan: entry.plan,
                    percentage: entry.percentage,
                    color: entry.color
                  });
                })}
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </div>
        </div>
      </CardContent>
    </div>
  );
};
