
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="flex items-center gap-2 px-2"
        >
          <span>{languages[language].flag}</span>
          <span className="text-sm text-black dark:text-gray-300">
            {languages[language].label}
          </span>
          <ChevronDown className="h-4 w-4 text-[#4c4c49] dark:text-[#67676c]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="bg-white dark:bg-[#1c1c1e] border border-[#e5e7eb] dark:border-[#232325] z-[1001]"
      >
        <DropdownMenuItem 
          onClick={() => handleLanguageChange('sv')} 
          className="flex items-center gap-2 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-[#2d2d2d]"
        >
          <span>🇸🇪</span> 
          <span className="flex-1">Svenska</span>
          {language === 'sv' && (
            <span className="text-xs text-[#000000A6] dark:text-[#FFFFFFA6] font-medium">
              aktiv
            </span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleLanguageChange('en')} 
          className="flex items-center gap-2 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-[#2d2d2d]"
        >
          <span>🇬🇧</span> 
          <span className="flex-1">English</span>
          {language === 'en' && (
            <span className="text-xs text-[#000000A6] dark:text-[#FFFFFFA6] font-medium">
              active
            </span>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
