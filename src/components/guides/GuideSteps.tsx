
import { GuideStep } from "./GuideStep";
import { useGuideUtils } from "@/utils/guideUtils";
import { useLanguage } from "@/contexts/LanguageContext";

interface GuideStepsProps {
  steps: Array<{ text: string }>;
  guideTitle: string;
}

export const GuideSteps = ({ steps, guideTitle }: GuideStepsProps) => {
  const { shouldShowCopyButton } = useGuideUtils();
  const { language } = useLanguage();

  return (
    <div className="space-y-4 px-6 pb-6">
      {steps.map((step, stepIndex) => {
        if (stepIndex === 0) return null;
        
        // Replace the translation key with the actual text for step 1
        let stepText = step.text;
        if (stepIndex === 1 && step.text === "guide.remove.button.step") {
          stepText = language === "sv" 
            ? "Klicka på knappen 'Ta bort'" 
            : "Click the 'Remove' button";
        }
        
        return (
          <GuideStep
            key={stepIndex}
            stepIndex={stepIndex}
            text={stepText}
            showCopyButton={shouldShowCopyButton(guideTitle, stepText)}
            guideTitle={guideTitle}
          />
        );
      })}
    </div>
  );
};
