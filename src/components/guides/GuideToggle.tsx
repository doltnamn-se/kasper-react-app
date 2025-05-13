
import { useLanguage } from "@/contexts/LanguageContext";

interface GuideToggleProps {
  guideTitle: string;
  isCompleted: boolean;
}

// This component now returns null to remove the toggle functionality
export const GuideToggle = ({ guideTitle, isCompleted }: GuideToggleProps) => {
  return null;
};
