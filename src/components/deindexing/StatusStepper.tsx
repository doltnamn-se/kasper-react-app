import { useLanguage } from "@/contexts/LanguageContext";
import { URLStatusHistory } from "@/types/url-management";
import { getStepIndex, getStatusText, STEPS, Step, Steps } from "./utils/statusUtils";
import { ProgressIndicator } from "./components/ProgressIndicator";
import { StepLabels } from "./components/StepLabels";
import { useTimestampHandler } from "./components/TimestampHandler";

type StatusStepperProps = {
  currentStatus: string;
  statusHistory?: URLStatusHistory[];
  showOnlyFinalStep?: boolean;
};

export const StatusStepper = ({ 
  currentStatus, 
  statusHistory = [],
  showOnlyFinalStep = false 
}: StatusStepperProps) => {
  const { t, language } = useLanguage();
  const { getTimestampForStep } = useTimestampHandler({ statusHistory, language });

  console.log('Current status received:', currentStatus);
  console.log('Status history:', statusHistory);

  const currentStepIndex = getStepIndex(currentStatus);
  const progressPercentage = 100; // Always 100% for completed items
  
  console.log('Progress percentage:', progressPercentage);

  const stepsToShow: Steps = showOnlyFinalStep ? [STEPS[STEPS.length - 1]] : STEPS;

  return (
    <div className="w-full flex flex-col gap-2">
      <StepLabels 
        currentStepIndex={currentStepIndex}
        getStatusText={(step) => getStatusText(step, t)}
        type="label"
        stepsToShow={stepsToShow}
      />

      <ProgressIndicator progressPercentage={progressPercentage} />

      <div className="mt-1">
        <StepLabels 
          currentStepIndex={currentStepIndex}
          getStatusText={(step) => getStatusText(step, t)}
          type="timestamp"
          getTimestamp={getTimestampForStep}
          stepsToShow={stepsToShow}
        />
      </div>
    </div>
  );
};