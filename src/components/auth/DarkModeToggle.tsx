import { Moon } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface DarkModeToggleProps {
  isDarkMode: boolean;
  onToggle: () => void;
}

export const DarkModeToggle = ({ isDarkMode, onToggle }: DarkModeToggleProps) => {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center">
        <Moon className="w-3 h-3 text-[#4c4c49] dark:text-[#67676c] stroke-[1.5]" />
      </div>
      <Switch
        checked={isDarkMode}
        onCheckedChange={onToggle}
        className="data-[state=checked]:bg-[#c3caf5] h-4 w-7 [&>span]:h-3 [&>span]:w-3"
      />
    </div>
  );
};