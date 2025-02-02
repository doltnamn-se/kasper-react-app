import { useLanguage } from "@/contexts/LanguageContext";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type StatusStepperProps = {
  currentStatus: string;
};

const STEPS = ['received', 'in_progress', 'request_submitted', 'completed'] as const;

export const StatusStepper = ({ currentStatus }: StatusStepperProps) => {
  const { t } = useLanguage();

  console.log('Current status received:', currentStatus); // Debug log

  const getStepIndex = (status: string) => {
    // Map the database status to our step status
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

    console.log('Mapped status:', mappedStatus); // Debug log
    const index = STEPS.indexOf(mappedStatus as typeof STEPS[number]);
    console.log('Step index:', index); // Debug log
    
    return index >= 0 ? index : 0;
  };

  const currentStepIndex = getStepIndex(currentStatus);
  const progressPercentage = ((currentStepIndex + 1) * 100) / STEPS.length;
  
  console.log('Progress percentage:', progressPercentage); // Debug log

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
          @keyframes moveStripes {
            0% { background-position: 0 0; }
            100% { background-position: -10px 0; }
          }
          .deindexing-progress {
            background-color: #e8e8e5;
          }
          .deindexing-progress-indicator {
            background-image: linear-gradient(
              -45deg,
              #000000 25%,
              #000000A6 25%,
              #000000A6 50%,
              #000000 50%,
              #000000 75%,
              #000000A6 75%,
              #000000A6 100%
            );
            background-size: 10px 10px;
            animation: moveStripes 2s linear infinite;
          }
        `}
      </style>
      <div className="relative">
        <Progress 
          value={progressPercentage} 
          className="h-3 rounded-full overflow-hidden mb-4 deindexing-progress"
          indicatorClassName="deindexing-progress-indicator dark:bg-white"
        />
        <div 
          className="absolute top-1/2 h-3 flex items-center -translate-y-1/2" 
          style={{ left: `${progressPercentage}%`, transform: 'translate(-50%, -50%)' }}
        >
          <div className="w-6 h-6 rounded-full bg-[#000000] dark:bg-white border-4 border-white dark:border-[#1c1c1e] shadow-[0_0_15px_rgba(0,0,0,0.25)] dark:shadow-[0_0_15px_rgba(255,255,255,0.25)]"></div>
        </div>
      </div>
      <div className="flex justify-between mt-2">
        {STEPS.map((step, index) => {
          const isActive = index <= currentStepIndex;
          const isCurrentStep = index === currentStepIndex;
          return (
            <div 
              key={step}
              className={cn(
                "text-xs text-center",
                isActive ? "text-black dark:text-white" : "text-[#616166]",
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