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
        const isCurrentStep = index === currentStepIndex;
        const shouldShow = index <= currentStepIndex;
        
        return (
          <div 
            key={`${type}-${step}`}
            className={cn(
              type === "label" ? "text-xs text-center font-normal" : "text-xs text-center text-[#000000A6] dark:text-[#FFFFFFA6]",
              type === "label" && isCurrentStep && "font-bold text-[#000000] dark:text-white",
              type === "label" && !isCurrentStep && "text-[#000000] dark:text-[#FFFFFFA6]",
              !shouldShow && "invisible",
              "w-[25%]"
            )}
          >
            {type === "label" ? getStatusText(step) : getTimestamp?.(step)}
          </div>
        );
      })}
    </div>
  );
};