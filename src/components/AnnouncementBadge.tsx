import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { BellRing } from 'lucide-react';

export const AnnouncementBadge = () => {
  const { language } = useLanguage();
  
  const message = language === 'sv' 
    ? "Digitaltskydd har bytt namn till Kasper"
    : "Digitaltskydd has changed name to Kasper";

  return (
    <div className="flex flex-col md:flex-row items-center gap-2 mb-6">
      <BellRing size={14} className="text-[#121212] md:order-first" />
      <div className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium" 
           style={{ 
             backgroundColor: '#d4f5bc'
           }}>
        <span className="text-[#121212]">{message}</span>
      </div>
    </div>
  );
};