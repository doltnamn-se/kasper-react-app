
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ChevronDown, Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect } from 'react';

export const LanguageSwitch = () => {
  const { language, setLanguage } = useLanguage();

  const languages = {
    sv: { flag: '🇸🇪', label: 'Svenska' },
    en: { flag: '🇬🇧', label: 'English' }
  };

  const handleLanguageChange = (lang: 'sv' | 'en') => {
    console.log('Language change clicked:', lang);
    setLanguage(lang);
  };

  useEffect(() => {
    console.log('LanguageSwitch rendered with language:', language);
  }, [language]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="flex items-center gap-2 px-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-black dark:text-white"
        >
          <Globe className="h-4 w-4" />
          <span>{languages[language].flag}</span>
          <span className="text-sm font-medium">
            {languages[language].label}
          </span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="bg-white dark:bg-[#1c1c1e] border border-gray-200 dark:border-gray-700 shadow-lg rounded-md min-w-[150px] z-50"
      >
        <DropdownMenuItem 
          onClick={() => handleLanguageChange('sv')} 
          className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 text-black dark:text-white"
        >
          <span>🇸🇪</span> Svenska
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleLanguageChange('en')} 
          className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 text-black dark:text-white"
        >
          <span>🇬🇧</span> English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
