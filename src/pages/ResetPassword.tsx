
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
    <div className="min-h-screen auth-page flex">
      {/* Left side - Authentication content */}
      <div className="w-full md:w-1/2 flex flex-col min-h-screen p-4 md:p-8 bg-[#FFFFFF] dark:bg-[#121212]">
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

      {/* Right side - App promotion background */}
      <div className="hidden md:block md:w-1/2 bg-[#FFFFFF] dark:bg-[#1a1a1a] relative overflow-hidden">
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-800/30 rounded-3xl p-8 w-full max-w-md shadow-xl backdrop-blur-sm">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-blue-800 dark:text-blue-300 mb-3">
                {language === 'sv' ? 'Digitaltskydd.se' : 'Digitaltskydd.se'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {language === 'sv' ? 'Ladda ner vår app för att skydda din digitala integritet' : 'Download our app to protect your digital privacy'}
              </p>
              <a 
                href="https://play.google.com/store/apps/details?id=se.digitaltskydd.app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-black text-white dark:bg-white dark:text-black px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6 mr-2" fill="currentColor">
                  <path d="M17.9,5.1c0.9,0.3,1.6,1.1,1.9,2l-7.9,7.8L7.7,10.7C9.8,8.8,14.2,5,17.9,5.1 M4.9,3.2 C5.4,3.6,6,4.2,6,5v14.1c0,0.8,0.7,1.4,1.2,1.7l-5.1-5.1L4.9,3.2 M6,19.1C6,19.3,6,19.4,6,19.5c0,0-0.1,0.1-0.1,0.1 c-0.1,0-0.1-0.1-0.1-0.1C5.9,19.4,6,19.2,6,19.1 M17.4,21.5c-0.9,0.1-1.9-0.2-3-0.8c-0.8-0.4-1.6-0.9-2.4-1.4c-0.5-0.3-1-0.7-1.5-1 c-0.6,0.4-1.1,0.7-1.7,1.1c-1,0.6-1.9,1.2-2.8,1.7c-0.6,0.3-1.2,0.6-1.8,0.6c-0.6,0.1-1.2-0.1-1.7-0.4l13.6-7.6l2.5,2.5 C19.7,20.6,18.8,21.3,17.4,21.5 M22,9.5c0,0.4-0.1,0.8-0.3,1.2l-1,1.6l-2.1-2.1L20.5,8c0.2,0.2,0.5,0.5,0.7,0.7 C21.6,9,22,9.2,22,9.5"/>
                </svg>
                Google Play
              </a>
            </div>
            <div className="mt-8 flex justify-center">
              <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-md transform rotate-3 hover:rotate-0 transition-transform">
                <img 
                  src="/lovable-uploads/digitaltskydd-favicon-blue.png" 
                  alt="App Screenshot" 
                  className="w-24 h-24 object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
