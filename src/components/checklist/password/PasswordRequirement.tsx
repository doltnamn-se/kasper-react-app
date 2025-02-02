import { Check } from "lucide-react";

interface PasswordRequirementProps {
  isValid: boolean;
  label: string;
}

export const PasswordRequirement = ({ isValid, label }: PasswordRequirementProps) => {
  return (
    <div className="flex items-center gap-2">
      <div className={`flex items-center justify-center w-4 h-4 rounded-full border-2 ${
        isValid 
          ? "border-[#219653] bg-[#219653]" 
          : "border-[#e0e0e0] dark:border-[#3a3a3b] bg-white dark:bg-[#1c1c1e]"
      }`}>
        {isValid && (
          <Check className="h-3 w-3 text-white stroke-[4]" />
        )}
      </div>
      <span className="text-sm font-medium text-[#000000A6] dark:text-[#FFFFFFA6]">
        {label}
      </span>
    </div>
  );
};