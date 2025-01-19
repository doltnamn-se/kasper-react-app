import { DarkModeToggle } from "./DarkModeToggle";
import { LanguageSwitch } from "../LanguageSwitch";

interface AuthSettingsProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const AuthSettings = ({ isDarkMode, onToggleDarkMode }: AuthSettingsProps) => {
  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="flex justify-between items-center">
        <LanguageSwitch />
        <DarkModeToggle isDarkMode={isDarkMode} onToggle={onToggleDarkMode} />
      </div>
    </div>
  );
};