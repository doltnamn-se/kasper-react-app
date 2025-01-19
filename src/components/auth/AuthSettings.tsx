import { DarkModeToggle } from "./DarkModeToggle";
import { LanguageSwitch } from "../LanguageSwitch";

interface AuthSettingsProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const AuthSettings = ({ isDarkMode, onToggleDarkMode }: AuthSettingsProps) => {
  return (
    <div className="flex justify-between items-center w-full max-w-sm mt-6 px-1">
      <LanguageSwitch />
      <DarkModeToggle isDarkMode={isDarkMode} onToggle={onToggleDarkMode} />
    </div>
  );
};