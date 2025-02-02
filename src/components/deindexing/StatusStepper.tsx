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
  const progressPercentage = ((currentStepIndex + 1) * 100) / STEPS.length;
  
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
          .progress-container {
            position: relative;
            width: 100%;
            height: 12px;
            margin-bottom: 16px;
          }

          .solid-progress {
            position: absolute;
            top: 0;
            left: 0;
            height: 100%;
            background-color: #08a621;
            border-radius: 9999px;
            transition: width 0.3s ease;
            width: ${progressPercentage}%;
          }

          .striped-progress {
            position: absolute;
            top: 0;
            left: ${progressPercentage}%;
            right: 0;
            height: 100%;
            background: linear-gradient(
              -45deg,
              #08a621 25%,
              #97ee86 25%,
              #97ee86 50%,
              #08a621 50%,
              #08a621 75%,
              #97ee86 75%,
              #97ee86 100%
            );
            background-size: 7px 7px;
            border-radius: 9999px;
            animation: moveStripes 1.8s linear infinite;
          }

          .progress-background {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: #97ee86;
            border-radius: 9999px;
          }

          @keyframes moveStripes {
            0% { background-position: 0 0; }
            100% { background-position: -10px 0; }
          }
        `}
      </style>
      <div className="relative">
        <div className="progress-container">
          <div className="progress-background" />
          <div className="solid-progress" />
          <div className="striped-progress" />
          <div 
            className="absolute top-1/2 -translate-y-1/2" 
            style={{ left: `${progressPercentage}%` }}
          >
            <div className="w-6 h-6 -ml-3 rounded-full bg-[#08a621] dark:bg-white border-4 border-white dark:border-[#1c1c1e] shadow-[0_0_15px_rgba(0,0,0,0.25)] dark:shadow-[0_0_15px_rgba(255,255,255,0.25)]"></div>
          </div>
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