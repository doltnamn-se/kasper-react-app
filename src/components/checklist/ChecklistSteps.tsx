import { Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
interface ChecklistStepsProps {
  checklistProgress: any;
  onStepClick: (step: number) => void;
}
export const ChecklistSteps = ({
  checklistProgress,
  onStepClick
}: ChecklistStepsProps) => {
  const {
    t
  } = useLanguage();
  const isStepCompleted = (step: number) => {
    if (!checklistProgress) return false;
    switch (step) {
      case 1:
        return checklistProgress.password_updated;
      case 2:
        return Boolean(checklistProgress.street_address && checklistProgress.postal_code && checklistProgress.city);
      default:
        return false;
    }
  };
  const steps = [{
    step: 1,
    title: t('step.1.title'),
    completed: isStepCompleted(1)
  }, {
    step: 2,
    title: t('step.4.title'),
    completed: isStepCompleted(2)
  }];
  console.log('ChecklistSteps - Progress state:', {
    checklistProgress,
    steps: steps.map(s => ({
      step: s.step,
      completed: s.completed
    })),
    removal_urls: checklistProgress?.removal_urls,
    selected_sites: checklistProgress?.selected_sites
  });
  return <div className="relative grid grid-cols-2 gap-8 max-w-xl mx-auto">
      {steps.map(item => <div key={item.step} className="flex flex-col items-center relative z-10">
          <div className="flex items-center gap-3">
            {item.completed ? <div className="flex-shrink-0 w-6 h-6 xl:w-8 xl:h-8 rounded-full bg-[#219653] flex items-center justify-center transition-all duration-300 ease-in-out">
                <Check className="w-3 h-3 xl:w-4 xl:h-4 text-white" />
              </div> : <div className={`flex-shrink-0 w-6 h-6 xl:w-8 xl:h-8 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out ${item.step === checklistProgress?.checklist_step ? 'bg-[#000000] dark:bg-white' : 'bg-[#e0e0e0] dark:bg-[#3A3A3B]'}`}>
                <span className={`text-xs font-medium transition-colors duration-300 ease-in-out ${item.step === checklistProgress?.checklist_step ? 'text-white dark:text-[#000000]' : 'text-[#000000A6] dark:text-[#FFFFFFA6]'}`}>
                  {item.step}
                </span>
              </div>}
            <div>
              <p className={`text-xs xl:text-sm font-medium transition-colors duration-300 ease-in-out ${item.completed ? 'text-[#000000A6] dark:text-[#FFFFFFA6]' : item.step === checklistProgress?.checklist_step ? 'text-[#000000] dark:text-white' : 'text-[#000000A6] dark:text-[#FFFFFFA6]'}`}>
                {item.title}
              </p>
            </div>
          </div>
        </div>)}
    </div>;
};