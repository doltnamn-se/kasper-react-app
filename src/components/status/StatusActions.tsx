
import React from "react";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useGuideOpener } from "@/hooks/useGuideOpener";

interface StatusActionsProps {
  status: string;
  siteName: string;
  onRemoveSite: (siteName: string) => void;
}

export const StatusActions: React.FC<StatusActionsProps> = ({ 
  status, 
  siteName, 
  onRemoveSite 
}) => {
  const { language } = useLanguage();
  const { isOpening } = useGuideOpener();

  if (status !== 'Synlig') {
    return null;
  }

  return (
    <Badge 
      variant="static" 
      className={`${isOpening ? 'bg-gray-500' : 'bg-[#ea384c]'} text-white dark:text-[#1c1c1e] text-xs cursor-pointer ${isOpening ? 'hover:bg-gray-600' : 'hover:bg-[#c02c3c]'} py-[0.2rem]`}
      onClick={() => onRemoveSite(siteName)}
    >
      {isOpening 
        ? (language === 'sv' ? 'Öppnar...' : 'Opening...') 
        : (language === 'sv' ? 'Ta bort' : 'Remove')}
    </Badge>
  );
};
