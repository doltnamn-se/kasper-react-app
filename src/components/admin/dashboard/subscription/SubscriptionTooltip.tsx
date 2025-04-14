
import React from "react";

interface SubscriptionTooltipProps {
  active: boolean;
  payload: any[];
  label?: string;
}

export const SubscriptionTooltip: React.FC<SubscriptionTooltipProps> = ({ 
  active, 
  payload 
}: SubscriptionTooltipProps) => {
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
