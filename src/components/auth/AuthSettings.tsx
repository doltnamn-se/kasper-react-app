import { DarkModeToggle } from "./DarkModeToggle";
import { LanguageSwitch } from "../LanguageSwitch";

interface AuthSettingsProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const AuthSettings = ({ isDarkMode, onToggleDarkMode }: AuthSettingsProps) => {
  return (
    <div className="flex flex-col items-center gap-2 mt-6">
      <DarkModeToggle isDarkMode={isDarkMode} onToggle={onToggleDarkMode} />
      <LanguageSwitch />
    </div>
  );
};