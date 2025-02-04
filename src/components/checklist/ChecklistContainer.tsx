import { useLanguage } from "@/contexts/LanguageContext";
import { StepProgress } from "./StepProgress";
import { StepContent } from "./StepContent";
import { useChecklistProgress } from "@/hooks/useChecklistProgress";
import { useChecklistItems } from "@/hooks/useChecklistItems";
import { useChecklistSteps } from "@/hooks/useChecklistSteps";
import { useStepCompletion } from "@/hooks/useStepCompletion";
import { useState, useEffect } from "react";

export const ChecklistContainer = () => {
  const { checklistProgress, calculateProgress } = useChecklistProgress();
  const { checklistItems } = useChecklistItems();
  const { currentStep, handleStepChange } = useChecklistSteps();
  const { handleStepComplete } = useStepCompletion();
  const [isAnimating, setIsAnimating] = useState(false);
  const [previousStep, setPreviousStep] = useState(currentStep);

  // Fixed total steps count to 4 main steps
  const totalStepsCount = 4;

  useEffect(() => {
    if (currentStep !== previousStep) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setPreviousStep(currentStep);
      }, 300); // Match this with the animation duration
      return () => clearTimeout(timer);
    }
  }, [currentStep, previousStep]);

  console.log('ChecklistContainer state:', {
    currentStep,
    previousStep,
    isAnimating,
    totalStepsCount,
    progress: calculateProgress()
  });

  return (
    <div className="space-y-0 animate-fadeInUp">
      <StepProgress progress={calculateProgress()} />
      <div className="space-y-8">
        <div className="step-content-wrapper">
          {[...Array(totalStepsCount)].map((_, index) => {
            const stepNumber = index + 1;
            const isCurrentStep = currentStep === stepNumber;
            const isPreviousStep = previousStep === stepNumber;
            
            console.log('Rendering step:', stepNumber, {
              isCurrentStep,
              isPreviousStep,
              isAnimating
            });
            
            return (
              <div 
                key={stepNumber}
                data-step={stepNumber}
                className={`transition-all duration-300 ease-in-out
                  ${!isCurrentStep && !isPreviousStep ? 'hidden' : ''}
                  ${isAnimating && isPreviousStep ? 'animate-slideOutLeft' : ''}
                  ${isAnimating && isCurrentStep ? 'animate-slideInRight' : ''}
                  ${!isAnimating && !isCurrentStep ? 'opacity-0' : 'opacity-100'}
                `}
                style={{ 
                  display: (!isCurrentStep && !isPreviousStep) || (!isAnimating && !isCurrentStep) ? 'none' : 'block'
                }}
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
      </div>
    </div>
  );
};