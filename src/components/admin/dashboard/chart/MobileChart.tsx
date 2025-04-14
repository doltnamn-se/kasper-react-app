
import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChartTooltip } from "./ChartTooltip";
import { CustomBarShape } from "./CustomBarShape";

interface MobileChartProps {
  chartData: any[];
  chartWidth: string | number;
  handleMouseMove: (e: any) => void;
  handleMouseLeave: () => void;
  activeBarIndex: number | null;
}

export const MobileChart: React.FC<MobileChartProps> = ({
  chartData,
  chartWidth,
  handleMouseMove,
  handleMouseLeave,
  activeBarIndex,
}) => {
  return (
    <ScrollArea className="h-full w-full overflow-hidden">
      <div style={{ width: `${chartWidth}px`, height: '140px' }}>
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
      </div>
    </ScrollArea>
  );
};
