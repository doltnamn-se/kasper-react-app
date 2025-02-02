import { useLanguage } from "@/contexts/LanguageContext";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type StatusStepperProps = {
  currentStatus: string;
};

const STEPS = ['received', 'in_progress', 'request_submitted', 'completed'] as const;

export const StatusStepper = ({ currentStatus }: StatusStepperProps) => {
  const { t } = useLanguage();

  console.log('Current status received:', currentStatus);

  const getStepIndex = (status: string) => {
    let mappedStatus = status;
    switch (status) {
      case 'case_started':
        mappedStatus = 'in_progress';
        break;
      case 'removal_approved':
        mappedStatus = 'completed';
        break;
      default:
        mappedStatus = status;
    }

    console.log('Mapped status:', mappedStatus);
    const index = STEPS.indexOf(mappedStatus as typeof STEPS[number]);
    console.log('Step index:', index);
    
    return index >= 0 ? index : 0;
  };

  const currentStepIndex = getStepIndex(currentStatus);
  // Calculate progress to align with the center of the current step's label
  const progressPercentage = (currentStepIndex * 100 + 50) / STEPS.length;
  
  console.log('Progress percentage:', progressPercentage);

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
    <div className="w-full">
      <style>
        {`
          @keyframes gradientFlow {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }
          .progress-indicator {
            background: linear-gradient(90deg, #000000, #4d4d4d, #000000);
            background-size: 200% 100%;
            animation: gradientFlow 5s linear infinite;
          }
          .dark .progress-indicator {
            background: linear-gradient(90deg, #FFFFFF, #CCCCCC, #FFFFFF);
            background-size: 200% 100%;
            animation: gradientFlow 5s linear infinite;
          }
        `}
      </style>
      <div className="relative">
        <Progress 
          value={progressPercentage} 
          className="h-2 rounded-full overflow-hidden mb-4 bg-[#e8e8e5] dark:bg-[#2f2e31]"
          indicatorClassName="progress-indicator"
        />
        <div 
          className="absolute top-1/2 h-2 flex items-center -translate-y-1/2" 
          style={{ left: `${progressPercentage}%`, transform: 'translate(-50%, -50%)' }}
        >
          <div className="w-4 h-4 rounded-full bg-[#000000] dark:bg-[#FFFFFF] border-2 border-white dark:border-[#222224] shadow-[0_0_10px_rgba(0,0,0,0.25)] dark:shadow-[0_0_10px_rgba(34,34,36,0.25)]"></div>
        </div>
      </div>
      <div className="flex justify-between mt-2">
        {STEPS.map((step, index) => {
          const isActive = index <= currentStepIndex;
          const isCurrentStep = index === currentStepIndex;
          const shouldShow = index <= currentStepIndex;
          return (
            <div 
              key={step}
              className={cn(
                "text-xs text-center",
                isCurrentStep ? "font-bold text-[#000000] dark:text-white" : "text-[#000000A6] dark:text-[#FFFFFFA6]",
                !shouldShow && "invisible",
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