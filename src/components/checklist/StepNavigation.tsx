import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onStepChange: (step: number) => void;
}

export const StepNavigation = ({ currentStep, totalSteps, onStepChange }: StepNavigationProps) => {
  const { language } = useLanguage();

  return (
    <div className="flex justify-between">
      {currentStep > 1 && (
        <Button
          variant="outline"
          onClick={() => onStepChange(Math.max(1, currentStep - 1))}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {language === 'en' ? 'Back' : 'Tillbaka'}
        </Button>
      )}
      {currentStep === 1 && <div />}
      <Button
        onClick={() => onStepChange(Math.min(totalSteps, currentStep + 1))}
        disabled={currentStep === totalSteps}
        className="gap-2"
      >
        {language === 'en' ? `Step ${currentStep + 1}` : `Steg ${currentStep + 1}`}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
};