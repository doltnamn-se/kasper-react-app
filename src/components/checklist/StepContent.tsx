import { useLanguage } from "@/contexts/LanguageContext";
import { StepGuide } from "./StepGuide";
import { PasswordUpdateForm } from "./PasswordUpdateForm";
import { HidingSitesSelection } from "./HidingSitesSelection";
import { UrlSubmission } from "./UrlSubmission";
import { PersonalInfoForm } from "./PersonalInfoForm";

interface StepContentProps {
  currentStep: number;
  onStepComplete: (step: number) => void;
  checklistItems: any[];
}

export const StepContent = ({ currentStep, onStepComplete, checklistItems }: StepContentProps) => {
  const { t, language } = useLanguage();

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1:
        return t('step.password.title');
      case 2:
        return language === 'sv' ? 'Avindexering' : 'Deindexing';
      case 3:
        return t('step.sites.title');
      case 4:
        return t('step.personal.title');
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
        return t('step.personal.description');
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
        <PasswordUpdateForm onComplete={() => onStepComplete(currentStep)} />
      )}
      {currentStep === 2 && (
        <UrlSubmission onComplete={() => onStepComplete(currentStep)} />
      )}
      {currentStep === 3 && (
        <HidingSitesSelection onComplete={() => onStepComplete(currentStep)} />
      )}
      {currentStep === 4 && (
        <PersonalInfoForm onComplete={() => onStepComplete(currentStep)} />
      )}

      {checklistItems.length > 0 && (
        <StepGuide items={checklistItems} currentStep={currentStep} />
      )}
    </div>
  );
};