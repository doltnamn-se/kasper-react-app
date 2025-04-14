
import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ChartTooltip } from "./ChartTooltip";
import { CustomBarShape } from "./CustomBarShape";

interface DesktopChartProps {
  chartData: any[];
  handleMouseMove: (e: any) => void;
  handleMouseLeave: () => void;
  activeBarIndex: number | null;
}

export const DesktopChart: React.FC<DesktopChartProps> = ({
  chartData,
  handleMouseMove,
  handleMouseLeave,
  activeBarIndex,
}) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart 
        data={chartData} 
        margin={{ top: 0, right: 0, left: -20, bottom: 5 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <XAxis 
          dataKey="date" 
          axisLine={false}
          tickLine={false}
          tick={false}
          height={10}
        />
        <YAxis hide={true} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: 'transparent' }} />
        <Bar 
          dataKey="count" 
          className="fill-[#10b981]"
          barSize={4} 
          radius={2}
          shape={(props) => (
            <CustomBarShape 
              {...props} 
              activeBarIndex={activeBarIndex}
            />
          )}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};
