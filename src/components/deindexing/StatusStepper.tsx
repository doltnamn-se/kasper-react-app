import { useLanguage } from "@/contexts/LanguageContext";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type StatusStepperProps = {
  currentStatus: string;
};

const STEPS = ['received', 'in_progress', 'request_submitted', 'completed'] as const;

export const StatusStepper = ({ currentStatus }: StatusStepperProps) => {
  const { t } = useLanguage();

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'received':
        return 1; // Start at 1 for 25%
      case 'in_progress':
        return 2; // 50%
      case 'request_submitted':
        return 3; // 75%
      case 'completed':
        return 4; // 100%
      default:
        return 1; // Default to first step (25%)
    }
  };

  const currentStepIndex = getStepIndex(currentStatus);
  // For 4 steps, we want progress to be 25%, 50%, 75%, or 100%
  const progressPercentage = currentStepIndex * 25;

  const getStatusText = (status: string) => {
    switch (status) {
      case 'received':
        return 'Mottagen';
      case 'in_progress':
        return 'Ärende påbörjat';
      case 'request_submitted':
        return 'Begäran inskickad';
      case 'completed':
        return 'Borttagning godkänd';
      default:
        return 'Mottagen';
    }
  };

  return (
    <div className="w-full">
      <Progress 
        value={progressPercentage} 
        className="h-2 rounded-full overflow-hidden mb-4 bg-[#2F2E31]"
        indicatorClassName="bg-white"
      />
      <div className="flex justify-between mt-2">
        {STEPS.map((step, index) => {
          const isActive = index <= currentStepIndex - 1;
          const isCurrentStep = index === currentStepIndex - 1;
          return (
            <div 
              key={step}
              className={cn(
                "text-xs text-center",
                isActive ? "text-white" : "text-[#616166]",
                isCurrentStep ? "font-medium" : "",
                "w-[25%]"
              )}
            >
              {getStatusText(step)}
            </div>
          );
        })}
      </div>
    </div>
  );
};