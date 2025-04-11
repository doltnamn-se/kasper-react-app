
import { useLanguage } from "@/contexts/LanguageContext";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";

interface SubscriptionData {
  plan: string;
  count: number;
}

// Define TimeRange type to match the one in AdminDashboard
type TimeRange = 'alltime' | 'ytd' | 'mtd' | '1year' | '4weeks' | '1week';

interface SubscriptionDistributionCardProps {
  subscriptionData: SubscriptionData[];
  timeRange?: TimeRange;
  onTimeRangeChange?: (range: TimeRange) => void;
}

export const SubscriptionDistributionCard = ({ 
  subscriptionData,
  timeRange = 'alltime',
  onTimeRangeChange
}: SubscriptionDistributionCardProps) => {
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

  // Time range dropdown
  const timeRangeDropdown = onTimeRangeChange ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="h-8 border border-[#e5e7eb] dark:border-[#232325] text-xs px-3 flex items-center gap-1"
        >
          {t(`timerange.${timeRange}` as keyof typeof t)}
          <ChevronDown className="h-3.5 w-3.5 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white dark:bg-[#1c1c1e] border border-[#e5e7eb] dark:border-[#232325] shadow-sm text-xs">
        <DropdownMenuItem onClick={() => onTimeRangeChange('alltime')} className="py-2 cursor-pointer">
          {t('timerange.alltime')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onTimeRangeChange('ytd')} className="py-2 cursor-pointer">
          {t('timerange.ytd')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onTimeRangeChange('mtd')} className="py-2 cursor-pointer">
          {t('timerange.mtd')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onTimeRangeChange('1year')} className="py-2 cursor-pointer">
          {t('timerange.1year')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onTimeRangeChange('4weeks')} className="py-2 cursor-pointer">
          {t('timerange.4weeks')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onTimeRangeChange('1week')} className="py-2 cursor-pointer">
          {t('timerange.1week')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : null;

  return (
    <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[4px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
      <div className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
        <h3 className="text-sm font-medium">
          {t('subscription.distribution')}
        </h3>
        {timeRangeDropdown}
      </div>
      <div className="p-0">
        <div className="flex flex-col h-[280px]">
          <div className="text-2xl font-bold">
            {total}
          </div>
          
          <div className="flex-1 mt-6 overflow-hidden">
            <ScrollArea className="h-[200px] w-full" orientation="horizontal">
              <div className="min-w-[600px] h-[200px]">
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
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
};
