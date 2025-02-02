import { Progress } from "@/components/ui/progress";

interface ProgressIndicatorProps {
  progressPercentage: number;
}

export const ProgressIndicator = ({ progressPercentage }: ProgressIndicatorProps) => {
  return (
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
  );
};