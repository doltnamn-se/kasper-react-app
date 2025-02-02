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
        const shouldShow = type === "label" ? true : index <= currentStepIndex;
        
        return (
          <div 
            key={`${type}-${step}`}
            className={cn(
              "w-[25%] text-xs text-center",
              type === "label" ? (
                isCurrentStep 
                  ? "font-bold text-[#000000] dark:text-white" 
                  : "text-[#000000] dark:text-[#FFFFFFA6]"
              ) : (
                "text-[#000000A6] dark:text-[#FFFFFFA6]"
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