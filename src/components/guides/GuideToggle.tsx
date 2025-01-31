import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/contexts/LanguageContext";
import { useGuideCompletion } from "@/hooks/useGuideCompletion";
import { useGuideUtils } from "@/utils/guideUtils";

interface GuideToggleProps {
  guideTitle: string;
  isCompleted: boolean;
}

export const GuideToggle = ({ guideTitle, isCompleted }: GuideToggleProps) => {
  const { language } = useLanguage();
  const { handleGuideComplete } = useGuideCompletion();
  const { getGuideId } = useGuideUtils();
  const [isToggling, setIsToggling] = useState(false);
  const [localCompleted, setLocalCompleted] = useState(isCompleted);

  const handleComplete = async (checked: boolean) => {
    if (isToggling) return;
    setIsToggling(true);
    setLocalCompleted(checked);
    
    console.log('Toggle clicked, current completion status:', checked);
    const guideId = getGuideId(guideTitle);
    if (!guideId) {
      setIsToggling(false);
      setLocalCompleted(!checked); // Revert on error
      return;
    }
    
    try {
      await handleGuideComplete(guideId);
    } catch (error) {
      console.error('Error toggling guide completion:', error);
      setLocalCompleted(!checked); // Revert on error
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="absolute top-4 right-4 flex items-center gap-2">
      <span className="text-sm text-[#4c4c49] dark:text-[#67676c]">
        {localCompleted 
          ? (language === 'sv' ? 'Klar' : 'Done')
          : (language === 'sv' ? 'Ej klar' : 'Not done')}
      </span>
      <Switch
        checked={localCompleted}
        onCheckedChange={handleComplete}
        disabled={isToggling}
        className="data-[state=checked]:bg-[#c3caf5] data-[state=unchecked]:bg-gray-200"
      />
    </div>
  );
};