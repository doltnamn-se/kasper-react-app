
import React from "react";
import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { SubscriptionTooltip } from "./SubscriptionTooltip";
import { ChartContainer } from "@/components/ui/chart";

interface SubscriptionData {
  name: string;
  plan: string;
  value: number;
  percentage: string;
}

interface SubscriptionBarChartProps {
  data: SubscriptionData[];
  isMobile?: boolean;
  chartWidth?: number | string;
}

export const SubscriptionBarChart = ({ 
  data, 
  isMobile = false,
  chartWidth = "100%" 
}: SubscriptionBarChartProps) => {
  
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
          fill="#000000"
          style={{ fill: 'var(--foreground)' }}
          textAnchor="start"
          fontSize="12"
        >
          {`${item.percentage}% (${item.value})`}
        </text>
      </g>
    );
  };

  return (
    <ChartContainer className="h-[200px] w-full" config={{}}>
      <ResponsiveContainer width={chartWidth} height="100%">
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
            tick={{
              fill: 'var(--foreground)',
              fontSize: 12,
              style: { fill: 'var(--foreground)' }
            }}
            width={80}
          />
          <Tooltip 
            content={(props) => {
              const { active, payload, label } = props;
              return <SubscriptionTooltip active={active} payload={payload} label={label} />;
            }}
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
  );
};
