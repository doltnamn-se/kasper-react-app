
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";

export const AppearanceSettings = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const { t, language } = useLanguage();
  const [mounted, setMounted] = useState(false);

  // Wait for component to be mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-base dark:text-white">
        {language === 'sv' ? 'Utseende' : 'Appearance'}
      </h3>
      <div className="flex gap-3">
        <Button
          onClick={() => setTheme('light')}
          variant={resolvedTheme === 'light' ? 'default' : 'outline'}
          className="flex gap-2 flex-1"
        >
          <Sun className="w-4 h-4" />
          <span>{language === 'sv' ? 'Ljust' : 'Light'}</span>
        </Button>
        <Button
          onClick={() => setTheme('dark')}
          variant={resolvedTheme === 'dark' ? 'default' : 'outline'}
          className="flex gap-2 flex-1"
        >
          <Moon className="w-4 h-4" />
          <span>{language === 'sv' ? 'Mörkt' : 'Dark'}</span>
        </Button>
      </div>
    </div>
  );
};
