
import { useEffect } from "react";
import { Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "next-themes";

export const ThemeToggle = () => {
  const { t } = useLanguage();
  const { resolvedTheme, setTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';

  // Update theme-color meta tag when theme changes
  useEffect(() => {
    const themeColor = isDarkMode ? '#161618' : '#fafafa';
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', themeColor);
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-[#000000A6] hover:text-[#000000] dark:text-[#FFFFFFA6] dark:hover:text-[#FFFFFF] h-8 w-8 flex items-center justify-center hover:bg-transparent"
          onClick={toggleDarkMode}
        >
          <Moon className="w-4 h-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{isDarkMode ? t('light.mode') : t('dark.mode')}</p>
      </TooltipContent>
    </Tooltip>
  );
};
