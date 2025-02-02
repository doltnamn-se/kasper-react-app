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
    <div className="w-full">
      <Progress 
        value={progressPercentage} 
        className="h-2.5 bg-[#E8E8E5] dark:bg-[#2F2E31] rounded-full overflow-hidden mb-4" 
        indicatorClassName="bg-black dark:bg-white rounded-full w-full"
      />
      <div className="flex justify-between mt-2">
        {STEPS.map((step) => (
          <div 
            key={step}
            className="text-xs text-center text-black dark:text-white"
            style={{ width: '25%' }}
          >
            {getStatusText(step)}
          </div>
        ))}
      </div>
    </div>
  );
};