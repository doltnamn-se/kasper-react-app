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
  
  const renderCustomBarLabel = (props: any) => {
    const { x, y, width, value, index } = props;
    
    const item = data[index];
    
    return (
      <g>
        <text
          x={x + width + 5}
          y={y + 10}
          textAnchor="start"
          fontSize="12"
          className="recharts-bar-label"
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
          margin={{ top: 5, right: 20, left: -30, bottom: 5 }}
        >
          <XAxis type="number" hide />
          <YAxis 
            type="category"
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{
              fontSize: 12
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
            className="fill-[#10b981] dark:fill-[#10b981]"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`}
                className="fill-[#10b981] dark:fill-[#10b981]"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};
