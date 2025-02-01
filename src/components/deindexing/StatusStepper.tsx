import { Check, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const statusSteps = {
  received: 0,
  case_started: 1,
  request_submitted: 2,
  removal_approved: 3,
} as const;

type StatusStepperProps = {
  currentStatus: keyof typeof statusSteps;
};

export const StatusStepper = ({ currentStatus }: StatusStepperProps) => {
  const { language } = useLanguage();
  const currentStep = statusSteps[currentStatus];

  const steps = [
    { key: 'received', label: language === 'sv' ? 'Mottagen' : 'Received' },
    { key: 'case_started', label: language === 'sv' ? 'Ärende påbörjat' : 'Case started' },
    { key: 'request_submitted', label: language === 'sv' ? 'Begäran inskickad' : 'Request submitted' },
    { key: 'removal_approved', label: language === 'sv' ? 'Borttagning godkänd' : 'Removal approved' },
  ];

  return (
    <div className="flex items-center space-x-2">
      {steps.map((step, index) => {
        const isCompleted = statusSteps[currentStatus] >= index;
        const isLast = index === steps.length - 1;

        return (
          <div key={step.key} className="flex items-center">
            <div
              className={`flex items-center justify-center w-6 h-6 rounded-full ${
                isCompleted
                  ? 'bg-black dark:bg-white text-white dark:text-black'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
              }`}
            >
              {isCompleted ? (
                <Check className="w-4 h-4" />
              ) : (
                <span className="text-xs">{index + 1}</span>
              )}
            </div>
            {!isLast && (
              <ChevronRight
                className={`w-4 h-4 ${
                  statusSteps[currentStatus] > index
                    ? 'text-black dark:text-white'
                    : 'text-gray-300 dark:text-gray-600'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};