import { Check, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Translations } from "@/translations/types";

interface ChecklistStepsProps {
  checklistProgress: any;
  onStepClick: (step: number) => void;
}

export const ChecklistSteps = ({ checklistProgress, onStepClick }: ChecklistStepsProps) => {
  const { t, language } = useLanguage();

  const getGuideTitle = (site: string): string => {
    type GuideKeys = Extract<keyof Translations, `guide.${string}.title`>;
    const siteTranslationKeys: Record<string, GuideKeys> = {
      'eniro': 'guide.eniro.title',
      'mrkoll': 'guide.mrkoll.title',
      'hitta': 'guide.hitta.title',
      'merinfo': 'guide.merinfo.title',
      'ratsit': 'guide.ratsit.title',
      'birthday': 'guide.birthday.title',
      'upplysning': 'guide.upplysning.title'
    };

    const translationKey = siteTranslationKeys[site.toLowerCase()];
    return translationKey ? t(translationKey) : site;
  };

  const steps = [
    { step: 1, title: t('step.1.title'), completed: checklistProgress?.password_updated },
    { step: 2, title: t('step.2.title'), completed: checklistProgress?.removal_urls?.length > 0 },
    { step: 3, title: t('step.3.title'), completed: checklistProgress?.selected_sites?.length > 0 },
    ...(checklistProgress?.selected_sites || []).map((site: string, index: number) => ({
      step: 4 + index,
      title: getGuideTitle(site),
      completed: checklistProgress?.completed_guides?.includes(site)
    })),
    { 
      step: 4 + (checklistProgress?.selected_sites?.length || 0), 
      title: t('step.4.title'), 
      completed: checklistProgress?.address && checklistProgress?.personal_number 
    }
  ];

  // Calculate if all steps are completed
  const isChecklistCompleted = steps.every(step => step.completed);

  return (
    <div className="relative">
      {isChecklistCompleted && (
        <div className="absolute inset-0 z-10 backdrop-blur-sm bg-white/30 dark:bg-black/30 rounded-lg flex items-center justify-center">
          <p className="text-lg font-semibold text-center px-4">
            {language === 'sv' ? 'Du är färdig med checklistan' : 'You have completed the checklist'}
          </p>
        </div>
      )}
      <div className="space-y-4">
        {steps.map((item) => (
          <div 
            key={item.step} 
            className={`flex items-center justify-between p-4 rounded-lg ${!item.completed ? 'bg-[#f8f8f7] dark:bg-[#2A2A2B]' : ''}`}
          >
            <div className="flex items-center gap-4">
              <div className={`flex-shrink-0 w-8 h-8 xl:w-10 xl:h-10 rounded-full ${item.completed ? 'opacity-40' : ''} bg-[#e0e0e0] dark:bg-[#3A3A3B] flex items-center justify-center`}>
                <span className="text-xs xl:text-sm font-medium">{item.step}</span>
              </div>
              <div className={item.completed ? 'opacity-40' : ''}>
                <p className="text-sm xl:text-base font-medium">{item.title}</p>
              </div>
            </div>
            <div className="flex items-center">
              {item.completed ? (
                <div className="flex-shrink-0 w-8 h-8 xl:w-10 xl:h-10 rounded-full bg-[#219653] flex items-center justify-center">
                  <Check className="w-4 h-4 xl:w-6 xl:h-6 text-white" />
                </div>
              ) : (
                <button 
                  onClick={() => !isChecklistCompleted && onStepClick(item.step)}
                  className={`flex-shrink-0 w-8 h-8 xl:w-10 xl:h-10 rounded-full hover:bg-gray-100 dark:hover:bg-[#3A3A3B] flex items-center justify-center transition-colors ${isChecklistCompleted ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  disabled={isChecklistCompleted}
                >
                  <ChevronRight className="w-4 h-4 xl:w-6 xl:h-6" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};