
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { AuthFooter } from "@/components/auth/AuthFooter";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { AuthEyeLogo } from "@/components/auth/AuthEyeLogo";
import { useTheme } from "next-themes";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const { resolvedTheme } = useTheme();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const { t, language } = useLanguage();
  
  // Use the appropriate background image based on theme
  const bgImage = resolvedTheme === 'dark' 
    ? "/lovable-uploads/ds-auth-bg-dark.png"
    : "/lovable-uploads/ds-auth-bg-light.png";

  useEffect(() => {
    document.title = language === 'sv' ? 
      "Återställ lösenord | Digitaltskydd.se" : 
      "Reset Password | Digitaltskydd.se";
    
    console.log("ResetPassword page loaded");
    console.log("URL:", window.location.href);
    console.log("Search params:", Object.fromEntries(searchParams.entries()));
    
    const checkRecoverySession = async () => {
      const type = searchParams.get('type');
      
      console.log("Checking recovery session - Type:", type);

      if (type === 'recovery') {
        try {
          // Check if we have a valid session after the recovery link was processed
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          console.log("Recovery session check:", session ? "exists" : "none");
          
          if (sessionError) {
            console.error("Session error:", sessionError);
            setError(t('error.invalid.recovery.link'));
            return;
          }
          
          if (session) {
            console.log("Valid recovery session found, user can reset password");
            setSessionReady(true);
          } else {
            console.error("No valid session found for recovery");
            setError(t('error.invalid.recovery.link'));
          }
        } catch (err) {
          console.error("Error checking recovery session:", err);
          setError(t('error.invalid.recovery.link'));
        }
      } else {
        console.log("Not a recovery flow, showing error");
        setError(t('error.invalid.recovery.link'));
      }
    };

    checkRecoverySession();
  }, [language, searchParams, t]);

  return (
    <div className="h-screen overflow-hidden auth-page flex">
      {/* Left side - Authentication content */}
      <div className="w-full md:w-1/2 flex flex-col h-screen p-4 md:p-8 bg-[#FFFFFF] dark:bg-[#1a1a1a]">
        <div className="flex-1 flex items-center justify-center w-full">
          <div className="w-full max-w-md space-y-8">
            <div className="bg-transparent p-8 w-full max-w-sm fade-in rounded-[7px] font-system-ui">
              <AuthEyeLogo />
              <h2 className="text-xl font-bold mb-10 text-left dark:text-white font-system-ui font-[700]">
                {t('reset.password')}
              </h2>

              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {!error && sessionReady && (
                <ResetPasswordForm
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                />
              )}

              {!error && !sessionReady && (
                <div className="text-center">
                  <p className="text-sm text-black dark:text-white">
                    {t('loading')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-auto">
          <AuthFooter />
        </div>
      </div>

      {/* Right side - Image background */}
      <div className="hidden md:block md:w-1/2 bg-[#FFFFFF] dark:bg-[#1a1a1a] h-screen p-[15px]">
        <div className="h-full w-full flex items-center justify-center p-0 rounded-lg overflow-hidden">
          <img 
            src={bgImage}
            alt="Digitaltskydd App" 
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
