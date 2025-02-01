import { Check, Loader } from "lucide-react";

type StatusStepperProps = {
  currentStatus: string;
};

export const StatusStepper = ({ currentStatus }: StatusStepperProps) => {
  // Map admin status to step number
  const getStepNumber = (status: string) => {
    switch (status) {
      case 'received':
        return 1;
      case 'in_progress':
        return 2;
      case 'completed':
        return 4;
      case 'failed':
        return 4; // Show as last step but with different styling
      default:
        return 1;
    }
  };

  const currentStep = getStepNumber(currentStatus);

  const steps = [1, 2, 3, 4].map(step => ({
    number: step,
    isActive: step <= currentStep,
    isCurrent: step === currentStep
  }));

  return (
    <div className="flex items-center space-x-2">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div
            className={`flex items-center justify-center w-6 h-6 rounded-full 
              ${step.isActive 
                ? currentStatus === 'failed'
                  ? 'bg-red-500 text-white'
                  : 'bg-green-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}
          >
            {step.isCurrent && currentStatus === 'in_progress' ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : step.isActive ? (
              <Check className="w-4 h-4" />
            ) : (
              <span className="text-sm">{step.number}</span>
            )}
          </div>
          {index < steps.length - 1 && (
            <div 
              className={`w-4 h-0.5 mx-1
                ${step.isActive && steps[index + 1].isActive
                  ? currentStatus === 'failed'
                    ? 'bg-red-500'
                    : 'bg-green-500'
                  : 'bg-gray-200 dark:bg-gray-700'
                }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};