import { useEffect } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthFooter } from "@/components/auth/AuthFooter";
import { AuthLogo } from "@/components/auth/AuthLogo";
import { useLanguage } from "@/contexts/LanguageContext";
import { DarkModeToggle } from "@/components/auth/DarkModeToggle";
import { LanguageSwitch } from "@/components/LanguageSwitch";

const Auth = () => {
  const { language } = useLanguage();

  useEffect(() => {
    document.title = language === 'sv' ? 
      "Logga in | Doltnamn.se" : 
      "Sign in | Doltnamn.se";
  }, [language]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-[400px] space-y-6">
        <div className="space-y-6">
          <AuthLogo />
          <AuthHeader />
          <AuthForm errorMessage="" isDarkMode={false} />
        </div>
        <AuthFooter>
          <div className="flex justify-between items-center w-full">
            <LanguageSwitch />
            <DarkModeToggle />
          </div>
        </AuthFooter>
      </div>
    </div>
  );
};

export default Auth;