import { useLanguage } from "@/contexts/LanguageContext";
import { Separator } from "@/components/ui/separator";
import { StepProgress } from "./StepProgress";
import { StepContent } from "./StepContent";
import { StepNavigation } from "./StepNavigation";
import { useChecklistProgress } from "@/hooks/useChecklistProgress";
import { useChecklistItems } from "@/hooks/useChecklistItems";
import { useChecklistSteps } from "@/hooks/useChecklistSteps";
import { useStepCompletion } from "@/hooks/useStepCompletion";

export const ChecklistContainer = () => {
  const { checklistProgress, calculateProgress } = useChecklistProgress();
  const { checklistItems } = useChecklistItems();
  const { currentStep, handleStepChange } = useChecklistSteps();
  const { handleStepComplete } = useStepCompletion();

  // Fixed total steps count to 4 main steps
  const totalStepsCount = 4;

  console.log('ChecklistContainer state:', {
    currentStep,
    totalStepsCount,
    progress: calculateProgress()
  });

  return (
    <div className="pt-0 space-y-6">
      <StepProgress progress={calculateProgress()} />
      <div className="space-y-8">
        <div className="step-content-wrapper">
          {[...Array(totalStepsCount)].map((_, index) => {
            const stepNumber = index + 1;
            console.log('Rendering step:', stepNumber, 'Current step:', currentStep);
            
            return (
              <div 
                key={stepNumber}
                data-step={stepNumber}
                style={{ display: currentStep === stepNumber ? 'block' : 'none' }}
              >
                <StepContent
                  currentStep={stepNumber}
                  onStepComplete={handleStepComplete}
                  checklistItems={checklistItems || []}
                />
              </div>
            );
          })}
        </div>
        <div className="py-8">
          <Separator className="bg-[#e0e0e0] dark:bg-[#3a3a3b]" />
        </div>
        <StepNavigation
          currentStep={currentStep}
          totalSteps={totalStepsCount}
          onStepChange={handleStepChange}
        />
      </div>
    </div>
  );
};