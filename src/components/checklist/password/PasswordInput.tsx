
import { Eye, EyeClosed } from "lucide-react";
import { Input } from "@/components/ui/input";

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  showPassword: boolean;
  onToggleVisibility: () => void;
  placeholder: string;
  className?: string;
}

export const PasswordInput = ({
  value,
  onChange,
  showPassword,
  onToggleVisibility,
  placeholder,
  className = ""
}: PasswordInputProps) => {
  return (
    <div className="relative w-full">
      <Input
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`h-12 w-full border-0 border-b border-[#e0e0e0] dark:border-[#3a3a3b] rounded-none font-medium text-black dark:text-white placeholder:text-[#000000A6] dark:placeholder:text-[#FFFFFFA6] placeholder:font-medium pl-0 pr-10 bg-transparent ${className}`}
      />
      <button
        type="button"
        onClick={onToggleVisibility}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-[#000000A6] dark:text-[#FFFFFFA6] hover:text-[#000000] dark:hover:text-[#FFFFFF] focus:outline-none"
      >
        {showPassword ? (
          <Eye className="h-5 w-5" />
        ) : (
          <EyeClosed className="h-5 w-5" />
        )}
      </button>
    </div>
  );
};
