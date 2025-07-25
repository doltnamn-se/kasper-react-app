import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export const AnnouncementBar = () => {
  const { language } = useLanguage();
  
  const message = language === 'sv' 
    ? "Digitaltskydd har bytt namn till Kasper"
    : "Digitaltskydd has changed name to Kasper";

  return (
    <div className="bg-primary text-primary-foreground text-center py-2 px-4 text-sm font-medium">
      {message}
    </div>
  );
};