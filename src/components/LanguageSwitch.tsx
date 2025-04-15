
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
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleLanguageChange('sv')} className="flex items-center gap-2">
          <span>🇸🇪</span> Svenska
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleLanguageChange('en')} className="flex items-center gap-2">
          <span>🇬🇧</span> English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
