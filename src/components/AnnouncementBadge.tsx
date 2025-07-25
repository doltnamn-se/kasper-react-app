import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Megaphone } from 'lucide-react';

export const AnnouncementBadge = () => {
  const { language } = useLanguage();
  
  const message = language === 'sv' 
    ? "Digitaltskydd har bytt namn till Kasper"
    : "Digitaltskydd has changed name to Kasper";

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6" 
         style={{ 
           backgroundColor: '#d4f5bc'
         }}>
      <Megaphone size={14} className="text-[#121212]" />
      <span className="text-[#121212]">{message}</span>
    </div>
  );
};