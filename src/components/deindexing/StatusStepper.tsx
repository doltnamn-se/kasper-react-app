import { Progress } from "@/components/ui/progress";

type StatusStepperProps = {
  currentStatus: string;
};

export const StatusStepper = ({ currentStatus }: StatusStepperProps) => {
  // Map status to progress percentage
  const getProgressPercentage = (status: string) => {
    switch (status) {
      case 'received':
        return 25;
      case 'in_progress':
        return 50;
      case 'completed':
        return 100;
      case 'failed':
        return 100; // Full width but with different styling
      default:
        return 25;
    }
  };

  const progressPercentage = getProgressPercentage(currentStatus);

  return (
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
  );
};