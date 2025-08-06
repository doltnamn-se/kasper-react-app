
import { useEffect } from "react";
import { Moon } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface DarkModeToggleProps {
  isDarkMode: boolean;
  onToggle: () => void;
}

export const DarkModeToggle = ({ isDarkMode, onToggle }: DarkModeToggleProps) => {
  // Update theme-color meta tag when theme changes
  useEffect(() => {
    const themeColor = isDarkMode ? '#161618' : '#fafafa';
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', themeColor);
    }
  }, [isDarkMode]);

  return (
    <div className="flex items-center gap-2">
      <Moon className="w-4 h-4 text-[#4c4c49] dark:text-[#67676c]" />
      <Switch
        checked={isDarkMode}
        onCheckedChange={onToggle}
        className="data-[state=checked]:bg-[#c3caf5] data-[state=unchecked]:bg-gray-200"
      />
    </div>
  );
};
