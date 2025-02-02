import { cn } from "@/lib/utils";
import { STEPS, Step, Steps } from "../utils/statusUtils";

interface StepLabelsProps {
  currentStepIndex: number;
  getStatusText: (step: string) => string;
  type: "label" | "timestamp";
  getTimestamp?: (step: string) => string;
  stepsToShow?: Steps;
}

export const StepLabels = ({ 
  currentStepIndex, 
  getStatusText, 
  type, 
  getTimestamp,
  stepsToShow = STEPS 
}: StepLabelsProps) => {
  return (
    <div className="flex justify-between">
      {stepsToShow.map((step, index) => {
        const originalIndex = STEPS.indexOf(step);
        const isActive = originalIndex <= currentStepIndex;
        const isCurrent = originalIndex === currentStepIndex;
        const shouldShow = type === "label" ? 
          originalIndex <= currentStepIndex : 
          (type === "timestamp" && originalIndex <= currentStepIndex);
        
        return (
          <div 
            key={`${type}-${step}`}
            className={cn(
              "w-full text-xs",
              type === "label" ? (
                isCurrent 
                  ? "font-bold text-[#000000] dark:text-white" 
                  : "font-medium text-[#000000A6] dark:text-[#FFFFFFA6]"
              ) : (
                isCurrent
                  ? "font-medium text-[#000000] dark:text-white"
                  : "text-[#000000A6] dark:text-[#FFFFFFA6]"
              ),
              "text-center",
              !shouldShow && "invisible"
            )}
          >
            {type === "label" ? (
              <div className="flex items-center justify-center gap-3">
                <div className={cn(
                  "flex items-center justify-center w-5 h-5 rounded-full",
                  isCurrent
                    ? "bg-[#000000] dark:bg-white"
                    : "bg-[#e0e0e0] dark:bg-[#2a2a2b]"
                )}>
                  <span className={cn(
                    "text-xs font-medium",
                    isCurrent
                      ? "text-white dark:text-[#000000]"
                      : "text-[#000000A6] dark:text-[#FFFFFFA6]"
                  )}>
                    {originalIndex + 1}
                  </span>
                </div>
                <span className="relative">
                  {getStatusText(step)}
                </span>
              </div>
            ) : (
              getTimestamp?.(step)
            )}
          </div>
        );
      })}
    </div>
  );
};