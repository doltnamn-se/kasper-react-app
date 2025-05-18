
import { useEffect } from "react";
import { DarkModeToggle } from "./DarkModeToggle";
import { LanguageSwitch } from "../LanguageSwitch";

interface AuthSettingsProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const AuthSettings = ({ isDarkMode, onToggleDarkMode }: AuthSettingsProps) => {
  // Ensure theme-color is set correctly on initial page load
  useEffect(() => {
    const themeColor = isDarkMode ? '#161618' : '#f4f4f4';
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', themeColor);
    }
  }, []);

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="flex justify-between items-center">
        <LanguageSwitch />
        <DarkModeToggle isDarkMode={isDarkMode} onToggle={onToggleDarkMode} />
      </div>
    </div>
  );
};
