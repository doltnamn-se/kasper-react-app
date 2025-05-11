
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, Translations } from '@/translations/types';
import { en } from '@/translations/en';
import { sv } from '@/translations/sv';

const translations: Record<Language, Translations> = { en, sv };

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof Translations, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    console.log('Initial language from localStorage:', saved);
    return (saved === 'en' || saved === 'sv') ? saved : 'en';
  });

  useEffect(() => {
    console.log('Setting language in localStorage:', language);
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: keyof Translations, params?: Record<string, string | number>): string => {
    let text = translations[language][key] || key;
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        text = text.replace(`{${key}}`, String(value));
      });
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
