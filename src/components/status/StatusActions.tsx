
import React from "react";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useGuideOpener } from "@/hooks/useGuideOpener";
import { useStatusUpdates } from "@/hooks/useStatusUpdates";

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
  const { isUpdating } = useStatusUpdates();

  if (status !== 'Synlig') {
    return null;
  }

  return (
    <Badge 
      variant="static" 
      className={`${isOpening || isUpdating ? 'bg-gray-500' : 'bg-[#ea384c]'} text-white dark:text-[#1c1c1e] text-xs cursor-pointer ${isOpening || isUpdating ? 'hover:bg-gray-600' : 'hover:bg-[#c02c3c]'} py-[0.2rem]`}
      onClick={() => onRemoveSite(siteName)}
    >
      {isOpening || isUpdating 
        ? (language === 'sv' ? 'Bearbetar...' : 'Processing...') 
        : (language === 'sv' ? 'Ta bort' : 'Remove')}
    </Badge>
  );
};
