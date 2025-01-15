import { Moon } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface DarkModeToggleProps {
  isDarkMode: boolean;
  onToggle: () => void;
}

export const DarkModeToggle = ({ isDarkMode, onToggle }: DarkModeToggleProps) => {
  return (
    <div className="flex items-center justify-center gap-6 px-4 py-3 bg-white dark:bg-[#232325] rounded-lg">
      <div className="flex items-center gap-3">
        <Moon className="w-4 h-4 text-[#4c4c49] dark:text-[#67676c] stroke-[1.5]" />
        <span className="text-sm text-[#1A1F2C] dark:text-slate-200">Mörkt läge</span>
      </div>
      <Switch
        checked={isDarkMode}
        onCheckedChange={onToggle}
        className="data-[state=checked]:bg-[#c3caf5] transition-colors duration-300"
      />
    </div>
  );
};