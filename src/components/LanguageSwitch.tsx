
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ChevronDown, Globe } from 'lucide-react';
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
    console.log('Language change requested:', lang);
    setLanguage(lang);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2 px-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2d2d2d] text-black dark:text-white"
        >
          <Globe className="h-4 w-4" />
          <span className="text-sm font-medium">
            {languages[language].flag} {languages[language].label}
          </span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[120px]">
        <DropdownMenuItem onClick={() => handleLanguageChange('sv')} className="flex items-center gap-2 cursor-pointer">
          <span>🇸🇪</span> Svenska
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleLanguageChange('en')} className="flex items-center gap-2 cursor-pointer">
          <span>🇬🇧</span> English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
