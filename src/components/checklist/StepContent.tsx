import { useLanguage } from "@/contexts/LanguageContext";
import { StepGuide } from "./StepGuide";
import { PasswordUpdateForm } from "./PasswordUpdateForm";
import { HidingSitesSelection } from "./HidingSitesSelection";
import { UrlSubmission } from "./UrlSubmission";
import { PersonalInfoForm } from "./PersonalInfoForm";

interface StepContentProps {
  currentStep: number;
  onStepComplete: (step: number) => Promise<void>;
  checklistItems: any[];
}

export const StepContent = ({ currentStep, onStepComplete, checklistItems }: StepContentProps) => {
  const { t, language } = useLanguage();

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1:
        return t('step.1.title');
      case 2:
        return language === 'sv' ? 'Avindexering' : 'Deindexing';
      case 3:
        return t('step.3.title');
      case 4:
        return t('step.4.title');
      default:
        return '';
    }
  };

  const getStepDescription = (step: number) => {
    switch (step) {
      case 1:
        return t('step.password.description');
      case 2:
        return t('step.deindexing.description');
      case 3:
        return t('step.sites.description');
      case 4:
        return t('step.4.description');
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-2">
          {getStepTitle(currentStep)}
        </h2>
        <p className="text-sm text-[#000000A6] dark:text-[#FFFFFFA6]">
          {getStepDescription(currentStep)}
        </p>
      </div>

      {currentStep === 1 && (
        <PasswordUpdateForm onComplete={async () => await onStepComplete(currentStep)} />
      )}
      {currentStep === 2 && (
        <UrlSubmission onComplete={async () => await onStepComplete(currentStep)} />
      )}
      {currentStep === 3 && (
        <HidingSitesSelection onComplete={async () => await onStepComplete(currentStep)} />
      )}
      {currentStep === 4 && (
        <PersonalInfoForm onComplete={async () => await onStepComplete(currentStep)} />
      )}

      {checklistItems.length > 0 && (
        <StepGuide 
          currentStep={currentStep}
          siteId={checklistItems[currentStep - 1]?.id || ''}
          guide={checklistItems[currentStep - 1]}
          isGuideCompleted={false}
          onGuideComplete={async () => Promise.resolve()}
        />
      )}
    </div>
  );
};