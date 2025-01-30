import { Badge } from "@/components/ui/badge";
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
    if (step === 2) return t('step.2.title');
    if (step === 3) return t('step.3.title');
    return t('step.identification.title');
  };

  const getStepDescription = (step: number) => {
    if (step === 1) return t('set.password.description');
    if (step === 2) return t('step.2.description');
    if (step === 3) return t('step.3.description');
    return t('step.identification.description');
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <Badge variant="outline" className="w-fit bg-black dark:bg-white text-white dark:text-black border-none font-medium">
        {t('step.number', { number: currentStep })}
      </Badge>
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold">
          {getStepTitle(currentStep)}
        </h3>
        <p className="text-sm font-medium text-[#000000A6] dark:text-[#FFFFFFA6]">
          {getStepDescription(currentStep)}
        </p>
      </div>
      <div className="pt-4">
        {(() => {
          switch (currentStep) {
            case 1:
              return <PasswordUpdateForm 
                onComplete={onStepComplete}
                buttonClassName="w-full xl:w-1/4 lg:w-1/2"
              />;
            case 2:
              return <UrlSubmission onComplete={onStepComplete} />;
            case 3:
              return <HidingSitesSelection onComplete={onStepComplete} />;
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