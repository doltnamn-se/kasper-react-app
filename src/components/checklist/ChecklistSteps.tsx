import { Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ChecklistStepsProps {
  checklistProgress: any;
  onStepClick: (step: number) => void;
}

export const ChecklistSteps = ({ checklistProgress, onStepClick }: ChecklistStepsProps) => {
  const { t } = useLanguage();

  const isStepCompleted = (step: number) => {
    if (!checklistProgress) return false;

    switch (step) {
      case 1:
        return checklistProgress.password_updated;
      case 2:
        return Array.isArray(checklistProgress.removal_urls) && 
          (checklistProgress.removal_urls.length > 0 || 
           checklistProgress.removal_urls.includes('skipped'));
      case 3:
        return checklistProgress.selected_sites?.length > 0;
      case 4:
        return Boolean(
          checklistProgress.street_address && 
          checklistProgress.postal_code && 
          checklistProgress.city
        );
      default:
        return false;
    }
  };

  const steps = [
    { step: 1, title: t('step.1.title'), completed: isStepCompleted(1) },
    { step: 2, title: t('step.2.title'), completed: isStepCompleted(2) },
    { step: 3, title: t('step.3.title'), completed: isStepCompleted(3) },
    { step: 4, title: t('step.4.title'), completed: isStepCompleted(4) }
  ];

  console.log('ChecklistSteps - Progress state:', {
    checklistProgress,
    steps: steps.map(s => ({ step: s.step, completed: s.completed })),
    removal_urls: checklistProgress?.removal_urls
  });

  return (
    <div className="grid grid-cols-4 gap-2">
      {steps.map((item) => (
        <div 
          key={item.step} 
          className={`flex flex-col items-center p-3 rounded-lg ${!item.completed ? 'bg-[#f8f8f7] dark:bg-[#2A2A2B]' : ''}`}
        >
          <div className="flex items-center gap-3">
            {item.completed ? (
              <div className="flex-shrink-0 w-6 h-6 xl:w-8 xl:h-8 rounded-full bg-[#219653] flex items-center justify-center">
                <Check className="w-3 h-3 xl:w-4 xl:h-4 text-white" />
              </div>
            ) : (
              <div className="flex-shrink-0 w-6 h-6 xl:w-8 xl:h-8 rounded-full bg-[#e0e0e0] dark:bg-[#3A3A3B] flex items-center justify-center">
                <span className="text-xs font-medium">{item.step}</span>
              </div>
            )}
            <div className={`${item.completed ? 'opacity-40' : ''}`}>
              <p className="text-xs xl:text-sm font-medium">{item.title}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};