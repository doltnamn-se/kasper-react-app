import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { ChecklistContainer } from "@/components/checklist/ChecklistContainer";
import { Card } from "@/components/ui/card";
import { useChecklistProgress } from "@/hooks/useChecklistProgress";
import { useChecklistItems } from "@/hooks/useChecklistItems";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect } from "react";
import { ChecklistProgress } from "@/components/checklist/ChecklistProgress";
import { ChecklistSteps } from "@/components/checklist/ChecklistSteps";

const Checklist = () => {
  const { t, language } = useLanguage();
  const isMobile = useIsMobile();
  const { checklistProgress, calculateProgress } = useChecklistProgress();
  const { checklistItems } = useChecklistItems();

  useEffect(() => {
    document.title = language === 'sv' ? 
      "Checklista | Doltnamn.se" : 
      "Checklist | Doltnamn.se";
  }, [language]);

  const handleStepClick = (stepNumber: number) => {
    console.log('Clicking step:', stepNumber);
    const checklistContainer = document.querySelector('.step-content-wrapper');
    if (!checklistContainer) {
      console.log('Container not found');
      return;
    }

    const stepElement = checklistContainer.querySelector(`[data-step="${stepNumber}"]`);
    if (stepElement) {
      console.log('Found step element, scrolling to it');
      stepElement.scrollIntoView({ behavior: 'smooth' });
      
      const containerInstance = document.querySelector('.checklist-component') as any;
      if (containerInstance && containerInstance.__reactFiber$) {
        const instance = containerInstance.__reactFiber$.child?.stateNode;
        if (instance && instance.setCurrentStep) {
          console.log('Updating current step to:', stepNumber);
          instance.setCurrentStep(stepNumber);
        } else {
          console.log('setCurrentStep not found on instance');
        }
      } else {
        console.log('Container instance not found');
      }
    } else {
      console.log('Step element not found');
    }
  };

  const progress = calculateProgress();

  return (
    <MainLayout>
      <div className="flex flex-wrap items-center gap-8 mb-6">
        <h1 className="text-2xl font-black tracking-[-.416px] text-[#000000] dark:text-white">
          {t('nav.checklist')}
        </h1>
        <ChecklistProgress progress={progress} />
        {!isMobile && (
          <span className="text-sm font-medium text-[#000000A6] dark:text-[#FFFFFFA6]">
            {t('step.progress', { 
              current: Math.ceil(progress / (100 / (4 + (checklistProgress?.selected_sites?.length || 0)))), 
              total: 4 + (checklistProgress?.selected_sites?.length || 0) 
            })}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="relative p-6 rounded-[4px] mb-6 dark:bg-[#1c1c1e] dark:border-[#232325]">
            <div className="space-y-8">
              <div className="checklist-component">
                <ChecklistContainer />
              </div>
            </div>
            {progress === 100 && (
              <div className="absolute inset-0 z-10 backdrop-blur-sm bg-white/30 dark:bg-black/30 rounded-[4px] flex items-center justify-center">
                <p className="text-lg font-semibold text-center px-4">
                  {language === 'sv' ? 'Du är färdig med checklistan' : 'You have completed the checklist'}
                </p>
              </div>
            )}
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6 rounded-[4px] dark:bg-[#1c1c1e] dark:border-[#232325]">
            <h2 className="text-lg font-semibold mb-4">{t('getting.started')}</h2>
            <ChecklistSteps 
              checklistProgress={checklistProgress}
              onStepClick={handleStepClick}
            />
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Checklist;