
import React from "react";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";

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

  if (status !== 'Synlig') {
    return null;
  }

  return (
    <Badge 
      variant="static" 
      className="bg-[#ea384c] text-white dark:text-[#1c1c1e] text-xs cursor-pointer hover:bg-[#c02c3c] py-[0.2rem]"
      onClick={() => onRemoveSite(siteName)}
    >
      {language === 'sv' ? 'Ta bort' : 'Remove'}
    </Badge>
  );
};
