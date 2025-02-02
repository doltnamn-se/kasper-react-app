import { cn } from "@/lib/utils";
import { STEPS } from "../utils/statusUtils";

interface StepLabelsProps {
  currentStepIndex: number;
  getStatusText: (step: string) => string;
  type: "label" | "timestamp";
  getTimestamp?: (step: string) => string;
}

export const StepLabels = ({ currentStepIndex, getStatusText, type, getTimestamp }: StepLabelsProps) => {
  return (
    <div className="flex justify-between">
      {STEPS.map((step, index) => {
        const isActive = index <= currentStepIndex;
        const isCurrent = index === currentStepIndex;
        const shouldShow = type === "label" || (type === "timestamp" && index <= currentStepIndex);
        
        return (
          <div 
            key={`${type}-${step}`}
            className={cn(
              "w-[25%] text-xs text-center",
              type === "label" ? (
                isCurrent 
                  ? "font-black text-[#000000] dark:text-white" 
                  : "font-medium text-[#000000A6] dark:text-[#FFFFFFA6]"
              ) : (
                isActive
                  ? "font-black text-[#000000] dark:text-white"
                  : "font-medium text-[#000000A6] dark:text-[#FFFFFFA6]"
              ),
              !shouldShow && "invisible"
            )}
          >
            {type === "label" ? getStatusText(step) : getTimestamp?.(step)}
          </div>
        );
      })}
    </div>
  );
};