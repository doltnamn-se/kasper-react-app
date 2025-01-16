import { useEffect, useState } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthFooter } from "@/components/auth/AuthFooter";
import { DarkModeToggle } from "@/components/auth/DarkModeToggle";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { useLanguage } from "@/contexts/LanguageContext";

const Auth = () => {
  const { language } = useLanguage();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    document.title = language === 'sv' ? 
      "Logga in | Doltnamn.se" : 
      "Sign in | Doltnamn.se";
  }, [language]);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-[400px] space-y-6">
        <div className="space-y-6">
          <AuthHeader />
          <AuthForm errorMessage="" isDarkMode={isDarkMode} />
        </div>
        <div className="flex justify-between items-center w-full">
          <LanguageSwitch />
          <DarkModeToggle isDarkMode={isDarkMode} onToggle={toggleDarkMode} />
        </div>
        <AuthFooter />
      </div>
    </div>
  );
};

export default Auth;