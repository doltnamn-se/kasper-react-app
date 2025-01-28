import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { GuideCard } from "@/components/guides/GuideCard";
import { Button } from "@/components/ui/button";
import { PasswordUpdateForm } from "./PasswordUpdateForm";
import { UrlSubmission } from "./UrlSubmission";
import { HidingSitesSelection } from "./HidingSitesSelection";
import { PersonalInfoForm } from "./PersonalInfoForm";

interface StepContentProps {
  currentStep: number;
  selectedSites: string[];
  completedGuides: string[] | null;
  onGuideComplete: (siteId: string) => Promise<void>;
  onStepComplete: () => Promise<void>;
  checklistItems: any[];
  getGuideForSite: (siteId: string) => any;
}

export const StepContent = ({
  currentStep,
  selectedSites,
  completedGuides,
  onGuideComplete,
  onStepComplete,
  checklistItems,
  getGuideForSite
}: StepContentProps) => {
  const { t, language } = useLanguage();
  const baseSteps = 4;

  // If we're on a guide step
  if (currentStep > 3 && currentStep < baseSteps + selectedSites.length) {
    const guideIndex = currentStep - 4;
    const siteId = selectedSites[guideIndex];
    const guide = getGuideForSite(siteId);
    
    if (!guide) return null;

    const isGuideCompleted = completedGuides?.includes(siteId);
    
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <Badge variant="outline" className="w-fit bg-black dark:bg-white text-white dark:text-black border-none font-medium">
            {t('step.number', { number: currentStep })}
          </Badge>
          <GuideCard
            guide={guide}
            accordionId={`guide-${siteId}`}
            openAccordion={`guide-${siteId}`}
            onAccordionChange={() => {}}
          />
          <Button
            onClick={() => onGuideComplete(siteId)}
            disabled={isGuideCompleted}
            className="w-full xl:w-1/4 lg:w-1/2"
          >
            {isGuideCompleted ? 
              (language === 'sv' ? 'Klart' : 'Completed') : 
              (language === 'sv' ? 'Markera som klar' : 'Mark as completed')}
          </Button>
        </div>
      </div>
    );
  }

  // Adjust the step number for the identification step
  const finalStepNumber = currentStep > 3 ? 4 : currentStep;
  const currentItem = checklistItems?.[finalStepNumber - 1];
  if (!currentItem) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <Badge variant="outline" className="w-fit bg-black dark:bg-white text-white dark:text-black border-none font-medium">
          {t('step.number', { number: currentStep })}
        </Badge>
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold">
            {finalStepNumber === 1 ? t('step.1.title') : 
             finalStepNumber === 2 ? t('step.2.title') : 
             finalStepNumber === 3 ? t('step.3.title') : 
             t('step.4.title')}
          </h3>
          <p className="text-sm font-medium text-[#000000A6] dark:text-[#FFFFFFA6]">
            {finalStepNumber === 1 ? t('set.password.description') :
             finalStepNumber === 2 ? t('step.2.description') :
             finalStepNumber === 3 ? t('step.3.description') :
             t('step.4.description')}
          </p>
        </div>
      </div>
      <div className="pt-4">
        {(() => {
          switch (finalStepNumber) {
            case 1:
              return <PasswordUpdateForm 
                onComplete={() => {
                  onStepComplete();
                  onStepComplete();
                }}
                buttonClassName="w-full xl:w-1/4 lg:w-1/2"
              />;
            case 2:
              return <UrlSubmission onComplete={() => {
                onStepComplete();
                onStepComplete();
              }} />;
            case 3:
              return <HidingSitesSelection onComplete={() => {
                onStepComplete();
                onStepComplete();
              }} />;
            case 4:
              return <PersonalInfoForm onComplete={onStepComplete} />;
            default:
              return null;
          }
        })()}
      </div>
    </div>
  );
};