import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";

type StatusStepperProps = {
  currentStatus: string;
};

export const StatusStepper = ({ currentStatus }: StatusStepperProps) => {
  const { t } = useLanguage();

  // Map status to progress percentage
  const getProgressPercentage = (status: string) => {
    switch (status) {
      case 'received':
        return 25;
      case 'in_progress':
        return 50;
      case 'request_submitted':
        return 75;
      case 'completed':
        return 100;
      case 'failed':
        return 100; // Full width but with different styling
      default:
        return 25;
    }
  };

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

  const progressPercentage = getProgressPercentage(currentStatus);

  return (
    <div className="flex items-center gap-4">
      <div className="w-32">
        <Progress 
          value={progressPercentage} 
          className="h-2.5 bg-[#e8e8e5] dark:bg-[#2f2e31] rounded-full overflow-hidden" 
          indicatorClassName={
            currentStatus === 'failed'
              ? 'bg-red-500 rounded-full'
              : 'bg-[#000000] dark:bg-[#c2c9f5] rounded-full'
          }
        />
      </div>
      <span className="text-sm text-[#000000A6] dark:text-[#FFFFFFA6]">
        {getStatusText(currentStatus)}
      </span>
    </div>
  );
};