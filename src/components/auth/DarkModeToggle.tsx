import { Moon } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface DarkModeToggleProps {
  isDarkMode: boolean;
  onToggle: () => void;
}

export const DarkModeToggle = ({ isDarkMode, onToggle }: DarkModeToggleProps) => {
  return (
    <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg">
      <div className="flex items-center">
        <Moon className="w-4 h-4 text-[#4c4c49] dark:text-[#67676c] stroke-[1.5]" />
      </div>
      <Switch
        checked={isDarkMode}
        onCheckedChange={onToggle}
        className="data-[state=checked]:bg-[#c3caf5] transition-transform duration-[400ms] ease-[cubic-bezier(0.85,0.05,0.18,1.35)]"
      />
    </div>
  );
};