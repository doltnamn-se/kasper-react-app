import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

type StatusStepperProps = {
  currentStatus: string;
};

const STEPS = ['received', 'in_progress', 'request_submitted', 'completed'] as const;

export const StatusStepper = ({ currentStatus }: StatusStepperProps) => {
  const { t } = useLanguage();

  const getStepIndex = (status: string) => {
    return STEPS.indexOf(status as typeof STEPS[number]);
  };

  const currentStepIndex = getStepIndex(currentStatus);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'received':
        return t('deindexing.status.received');
      case 'in_progress':
        return t('deindexing.status.case.started');
      case 'request_submitted':
        return t('deindexing.status.request.submitted');
      case 'completed':
        return t('deindexing.status.removal.approved');
      default:
        return t('deindexing.status.received');
    }
  };

  return (
    <div className="w-full max-w-3xl">
      <div className="relative">
        {/* Steps container */}
        <div className="flex justify-between mb-2">
          {STEPS.map((step, index) => {
            const isCompleted = currentStepIndex > index;
            const isCurrent = currentStepIndex === index;
            
            return (
              <div 
                key={step} 
                className={cn(
                  "flex flex-col items-center relative z-10",
                  (isCompleted || isCurrent) ? "text-black dark:text-white" : "text-gray-400"
                )}
              >
                {/* Step circle */}
                <div 
                  className={cn(
                    "w-8 h-8 rounded-full border-2 flex items-center justify-center mb-2",
                    isCompleted ? "bg-black dark:bg-[#c2c9f5] border-black dark:border-[#c2c9f5]" : 
                    isCurrent ? "border-black dark:border-[#c2c9f5] bg-white dark:bg-[#1c1c1e]" : 
                    "border-gray-300 dark:border-gray-600"
                  )}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4 text-white dark:text-black" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                    </svg>
                  ) : (
                    <span className={cn(
                      "text-sm",
                      isCurrent ? "text-black dark:text-white" : "text-gray-400"
                    )}>{index + 1}</span>
                  )}
                </div>
                {/* Step label */}
                <span className="text-sm text-center w-24">{getStatusText(step)}</span>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="absolute top-4 left-0 w-full h-[2px] bg-gray-200 dark:bg-gray-700 -z-10">
          <div 
            className="h-full bg-black dark:bg-[#c2c9f5] transition-all duration-300"
            style={{ 
              width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};