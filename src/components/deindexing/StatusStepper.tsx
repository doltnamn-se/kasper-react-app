import { useLanguage } from "@/contexts/LanguageContext";
import { URLStatusHistory } from "@/types/url-management";
import { getStepIndex, getStatusText, STEPS } from "./utils/statusUtils";
import { ProgressIndicator } from "./components/ProgressIndicator";
import { StepLabels } from "./components/StepLabels";
import { useTimestampHandler } from "./components/TimestampHandler";

type StatusStepperProps = {
  currentStatus: string;
  statusHistory?: URLStatusHistory[];
};

export const StatusStepper = ({ currentStatus, statusHistory = [] }: StatusStepperProps) => {
  const { t, language } = useLanguage();
  const { getTimestampForStep } = useTimestampHandler({ statusHistory, language });

  console.log('Current status received:', currentStatus);
  console.log('Status history:', statusHistory);

  const currentStepIndex = getStepIndex(currentStatus);
  const progressPercentage = currentStepIndex === STEPS.length - 1 ? 
    100 : 
    (currentStepIndex * 100 + 50) / STEPS.length;
  
  console.log('Progress percentage:', progressPercentage);

  return (
    <div className="w-full">
      <style>
        {`
          @keyframes gradientFlow {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }
          .progress-indicator {
            background: linear-gradient(90deg, #000000, #4d4d4d, #000000);
            background-size: 200% 100%;
            animation: gradientFlow 5s linear infinite;
          }
          .dark .progress-indicator {
            background: linear-gradient(90deg, #FFFFFF, #CCCCCC, #FFFFFF);
            background-size: 200% 100%;
            animation: gradientFlow 5s linear infinite;
          }
        `}
      </style>
      
      <StepLabels 
        currentStepIndex={currentStepIndex}
        getStatusText={(step) => getStatusText(step, t)}
        type="label"
      />

      <ProgressIndicator progressPercentage={progressPercentage} />

      <StepLabels 
        currentStepIndex={currentStepIndex}
        getStatusText={(step) => getStatusText(step, t)}
        type="timestamp"
        getTimestamp={getTimestampForStep}
      />
    </div>
  );
};