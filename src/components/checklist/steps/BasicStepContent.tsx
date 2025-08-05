import { useLanguage } from "@/contexts/LanguageContext";
import { PasswordUpdateForm } from "../PasswordUpdateForm";
import { UrlSubmission } from "../UrlSubmission";
import { HidingSitesSelection } from "../HidingSitesSelection";
import { PersonalInfoForm } from "../PersonalInfoForm";

interface BasicStepContentProps {
  currentStep: number;
  onStepComplete: () => Promise<void>;
  customerData: any;
}

export const BasicStepContent = ({
  currentStep,
  onStepComplete,
  customerData
}: BasicStepContentProps) => {
  const { t } = useLanguage();

  const getStepTitle = (step: number) => {
    if (step === 1) return t('step.1.title');
    if (step === 2) return t('step.4.title'); // Address step moved to step 2
    return t('step.identification.title');
  };

  const getStepDescription = (step: number) => {
    if (step === 1) return t('set.password.description');
    if (step === 2) return t('step.4.description'); // Address description moved to step 2
    return t('step.identification.description');
  };

  return (
    <div className="space-y-4 animate-fade-in w-full">
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold">
          {getStepTitle(currentStep)}
        </h3>
        <p className="text-sm font-medium text-[#000000A6] dark:text-[#FFFFFFA6]">
          {getStepDescription(currentStep)}
        </p>
      </div>
      <div className="pt-4 w-full">
        {(() => {
          switch (currentStep) {
            case 1:
              return <PasswordUpdateForm 
                onComplete={onStepComplete}
                className="w-full"
                buttonClassName="w-full"
              />;
            case 2:
              return <PersonalInfoForm onComplete={onStepComplete} />;
            default:
              return null;
          }
        })()}
      </div>
    </div>
  );
};