import { GuideStep } from "./GuideStep";
import { useGuideUtils } from "@/utils/guideUtils";

interface GuideStepsProps {
  steps: Array<{ text: string }>;
  guideTitle: string;
}

export const GuideSteps = ({ steps, guideTitle }: GuideStepsProps) => {
  const { shouldShowCopyButton } = useGuideUtils();

  return (
    <div className="space-y-4 px-6 pb-6">
      {steps.map((step, stepIndex) => {
        if (stepIndex === 0) return null;
        
        return (
          <GuideStep
            key={stepIndex}
            stepIndex={stepIndex}
            text={step.text}
            showCopyButton={shouldShowCopyButton(guideTitle, step.text)}
            guideTitle={guideTitle}
          />
        );
      })}
    </div>
  );
};