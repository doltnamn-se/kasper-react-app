import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export const AnnouncementBadge = () => {
  const { language } = useLanguage();
  
  const message = language === 'sv' 
    ? "Digitaltskydd har bytt namn till Kasper"
    : "Digitaltskydd has changed name to Kasper";

  return (
    <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-6">
      {message}
    </div>
  );
};