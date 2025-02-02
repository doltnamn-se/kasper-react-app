import { useLanguage } from "@/contexts/LanguageContext";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

type StatusStepperProps = {
  currentStatus: string;
  statusHistory?: Array<{
    status: string;
    timestamp: string;
  }>;
};

const STEPS = ['received', 'in_progress', 'request_submitted', 'completed'] as const;

export const StatusStepper = ({ currentStatus, statusHistory = [] }: StatusStepperProps) => {
  const { t } = useLanguage();

  console.log('Current status received:', currentStatus);
  console.log('Status history:', statusHistory);

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
  // Adjust progress calculation for the last step
  const progressPercentage = currentStepIndex === STEPS.length - 1 ? 
    100 : // If it's the last step, fill the bar completely
    (currentStepIndex * 100 + 50) / STEPS.length; // Otherwise, use the original calculation
  
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

  const getTimestampForStep = (step: string) => {
    const historyEntry = statusHistory.find(entry => {
      const mappedStatus = entry.status === 'case_started' ? 'in_progress' : 
                          entry.status === 'removal_approved' ? 'completed' : 
                          entry.status;
      return mappedStatus === step;
    });
    
    return historyEntry ? format(new Date(historyEntry.timestamp), 'yyyy-MM-dd HH:mm') : '';
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
      
      {/* Step Labels above the progress bar */}
      <div className="flex justify-between mb-2">
        {STEPS.map((step, index) => {
          const isActive = index <= currentStepIndex;
          const isCurrentStep = index === currentStepIndex;
          const shouldShow = index <= currentStepIndex;
          return (
            <div 
              key={`label-${step}`}
              className={cn(
                "text-xs text-center font-normal",
                isCurrentStep ? "font-bold text-[#000000] dark:text-white" : "text-[#000000] dark:text-[#FFFFFFA6]",
                !shouldShow && "invisible",
                "w-[25%]"
              )}
            >
              {getStatusText(step)}
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <Progress 
          value={progressPercentage} 
          className="h-2.5 rounded-full overflow-hidden bg-[#e8e8e5] dark:bg-[#2f2e31]"
          indicatorClassName="progress-indicator"
        />
        <div 
          className="absolute top-1/2 h-2.5 flex items-center -translate-y-1/2" 
          style={{ left: `${progressPercentage}%`, transform: 'translate(-50%, -50%)' }}
        >
          <div className="w-4 h-4 rounded-full bg-[#000000] dark:bg-[#FFFFFF] border-2 border-white dark:border-[#222224] shadow-[0_0_10px_rgba(0,0,0,0.25)] dark:shadow-[0_0_10px_rgba(34,34,36,0.25)]"></div>
        </div>
      </div>

      {/* Timestamps below the progress bar */}
      <div className="flex justify-between mt-2">
        {STEPS.map((step, index) => {
          const shouldShow = index <= currentStepIndex;
          const timestamp = getTimestampForStep(step);
          return (
            <div 
              key={`timestamp-${step}`}
              className={cn(
                "text-xs text-center text-[#000000A6] dark:text-[#FFFFFFA6]",
                !shouldShow && "invisible",
                "w-[25%]"
              )}
            >
              {timestamp}
            </div>
          );
        })}
      </div>
    </div>
  );
};