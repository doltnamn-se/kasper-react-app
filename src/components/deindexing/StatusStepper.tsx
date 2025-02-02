import { useLanguage } from "@/contexts/LanguageContext";
import { Progress } from "@/components/ui/progress";

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
  const progressPercentage = (currentStepIndex / (STEPS.length - 1)) * 100;

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
    <div className="w-full max-w-sm">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium">
          {getStatusText(currentStatus)}
        </span>
        <span className="text-xs text-[#000000A6] dark:text-[#FFFFFFA6]">
          {Math.round(progressPercentage)}%
        </span>
      </div>
      <Progress 
        value={progressPercentage} 
        className="h-2.5 bg-[#e8e8e5] dark:bg-[#2f2e31] rounded-full overflow-hidden" 
        indicatorClassName="bg-[#000000] dark:bg-[#c2c9f5] rounded-full"
      />
    </div>
  );
};