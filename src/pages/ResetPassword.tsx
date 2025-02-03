import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthSettings } from "@/components/auth/AuthSettings";
import { AuthFooter } from "@/components/auth/AuthFooter";
import { PasswordUpdateForm } from "@/components/checklist/PasswordUpdateForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t, language } = useLanguage();

  useEffect(() => {
    document.title = language === 'sv' ? 
      "Återställ lösenord | Doltnamn.se" : 
      "Reset Password | Doltnamn.se";

    const isDark = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }

    // Verify the recovery token
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
    // Sign out and redirect to login with success message
    await supabase.auth.signOut();
    window.location.href = '/auth?reset_success=true';
  };

  return (
    <div className="min-h-screen bg-[#f6f6f4] dark:bg-[#161618] flex flex-col items-center justify-between p-4">
      <div className="w-full max-w-md space-y-8 mt-8">
        <AuthHeader />
        
        <div className="flex justify-center w-full">
          <div className="bg-white dark:bg-[#232325] p-8 border border-gray-200 dark:border-[#303032] w-full max-w-sm fade-in rounded-[7px] font-system-ui">
            <h2 className="text-xl font-bold mb-6 text-center dark:text-white font-system-ui font-[700]">
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
                buttonText={t('update.password')}
                className="w-full"
              />
            )}
          </div>
        </div>

        <AuthSettings isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />
      </div>
      <AuthFooter />
    </div>
  );
};

export default ResetPassword;