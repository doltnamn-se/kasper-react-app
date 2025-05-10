
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthSettings } from "@/components/auth/AuthSettings";
import { AuthFooter } from "@/components/auth/AuthFooter";
import { PasswordUpdateForm } from "@/components/checklist/PasswordUpdateForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t, language } = useLanguage();

  useEffect(() => {
    document.title = language === 'sv' ? 
      "Återställ lösenord | Digitaltskydd.se" : 
      "Reset Password | Digitaltskydd.se";

    const isDark = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }

    const verifyToken = async () => {
      const accessToken = searchParams.get('access_token');
      if (!accessToken) {
        setError(t('error.invalid.recovery.link'));
        return;
      }

      try {
        const { error: verifyError } = await supabase.auth.getSession();
        if (verifyError) {
          console.error("Error verifying recovery token:", verifyError);
          setError(t('error.invalid.recovery.link'));
        }
      } catch (err) {
        console.error("Error in recovery verification:", err);
        setError(t('error.invalid.recovery.link'));
      }
    };

    verifyToken();
  }, [language, searchParams, t]);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', String(newDarkMode));
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleComplete = async () => {
    await supabase.auth.signOut();
    window.location.href = '/auth?reset_success=true';
  };

  return (
    <div className="h-screen overflow-hidden auth-page flex">
      {/* Left side - Authentication content */}
      <div className="w-full md:w-1/2 flex flex-col h-screen p-4 md:p-8 bg-[#FFFFFF] dark:bg-[#121212]">
        <AuthHeader />
        
        <div className="flex-1 flex items-center justify-center w-full">
          <div className="w-full max-w-md space-y-8">
            <div className="bg-white/30 dark:bg-[#232325]/30 backdrop-blur-xl backdrop-saturate-150 p-8 border border-white/20 dark:border-[#303032]/20 w-full max-w-sm fade-in rounded-[7px] font-system-ui shadow-lg">
              <h2 className="text-xl font-bold mb-10 text-center dark:text-white font-system-ui font-[700]">
                {t('reset.password')}
              </h2>

              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {!error && (
                <PasswordUpdateForm
                  onComplete={handleComplete}
                  showSuccessToast={true}
                  showSuccessAnimation={true}
                />
              )}
            </div>
          </div>
        </div>

        <div className="mt-auto">
          <AuthSettings isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />
          <AuthFooter />
        </div>
      </div>

      {/* Right side - Image background */}
      <div className="hidden md:block md:w-1/2 bg-[#eef2f7] dark:bg-[#1a1a1a] h-screen overflow-hidden">
        <div className="h-full w-full flex items-end justify-start p-10 pb-10 pr-10 pt-10">
          <div className="w-full h-full rounded-2xl overflow-hidden shadow-lg">
            <img 
              src="/lovable-uploads/digitaltskydd-app-auth-frame-android-portrait-33.jpg" 
              alt="Digitaltskydd App" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

