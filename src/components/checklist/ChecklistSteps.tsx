import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ChecklistStepsProps {
  checklistProgress?: {
    password_updated?: boolean;
    selected_sites?: string[];
    removal_urls?: string[];
    address?: string;
  };
  onStepClick?: (step: number) => void;
}

export const ChecklistSteps = ({ checklistProgress, onStepClick }: ChecklistStepsProps) => {
  const { t } = useLanguage();

  const steps = [
    {
      step: 1,
      title: t('checklist.step1.title'),
      isComplete: checklistProgress?.password_updated || false,
    },
    {
      step: 2,
      title: t('checklist.step2.title'),
      isComplete: checklistProgress?.selected_sites && checklistProgress.selected_sites.length > 0,
    },
    {
      step: 3,
      title: t('checklist.step3.title'),
      isComplete: checklistProgress?.removal_urls && checklistProgress.removal_urls.length > 0,
    },
    {
      step: 4,
      title: t('checklist.step4.title'),
      isComplete: !!checklistProgress?.address,
    },
  ];

  return (
    <div className="bg-white/30 dark:bg-[#232325]/30 backdrop-blur-xl backdrop-saturate-150 border border-white/20 dark:border-[#303032]/20 rounded-[7px] p-6 shadow-lg">
      <div className="grid grid-cols-4 gap-2">
        {steps.map((item) => (
          <div 
            key={item.step}
            className={cn(
              "relative flex flex-col items-center justify-start p-4 rounded-md cursor-pointer transition-all duration-200",
              "hover:bg-black/5 dark:hover:bg-white/5"
            )}
            onClick={() => onStepClick?.(item.step)}
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-[#1C1C1D] border border-[#e0e0e0] dark:border-[#3A3A3B] mb-2">
              <span className="text-sm font-medium">
                {item.step}
              </span>
            </div>
            <span className="text-xs text-center font-medium">
              {item.title}
            </span>
            {item.isComplete && (
              <Badge 
                className="absolute -top-2 -right-2 bg-green-500 hover:bg-green-600"
                variant="secondary"
              >
                ✓
              </Badge>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};