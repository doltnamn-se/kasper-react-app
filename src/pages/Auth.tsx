
import { useEffect, useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthFooter } from "@/components/auth/AuthFooter";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { initializeVersionTracking, useVersionStore } from "@/config/version";
import { getLatestVersion } from "@/utils/versionUtils";
import { useTheme } from "next-themes";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [errorMessage, setErrorMessage] = useState("");
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';
  const { t, language } = useLanguage();
  const [isResetPasswordMode, setIsResetPasswordMode] = useState(false);
  const setVersion = useVersionStore((state) => state.setVersion);
  const [versionInitialized, setVersionInitialized] = useState(false);

  // Use the appropriate background image based on theme
  const bgImage = isDarkMode 
    ? "/lovable-uploads/ds-auth-bg-dark.png"
    : "/lovable-uploads/ds-auth-bg-light.png";

  useEffect(() => {
    document.title = language === 'sv' ? 
      "Logga in | Digitaltskydd.se" : 
      "Log in | Digitaltskydd.se";

    const lightLogo = new Image();
    const darkLogo = new Image();
    lightLogo.src = "/lovable-uploads/a60e3543-e8d5-4f66-a2eb-97eeedd073ae.png";
    darkLogo.src = "/lovable-uploads/868b20a1-c3f1-404c-b8da-9d33fe738d9d.png";

    // Initialize version tracking
    initializeVersionTracking();

    // Also fetch latest version directly to ensure it's available immediately
    const fetchLatestVersion = async () => {
      try {
        const latestVersion = await getLatestVersion();
        if (latestVersion) {
          console.log('Setting version on Auth page:', latestVersion.version_string);
          setVersion(latestVersion.version_string);
        } else {
          console.log('No version found, keeping default');
        }
        setVersionInitialized(true);
      } catch (err) {
        console.error('Error fetching version:', err);
        setVersionInitialized(true);
      }
    };
    
    fetchLatestVersion();

    const handleRecoveryFlow = async () => {
      const type = searchParams.get('type');
      const accessToken = searchParams.get('access_token');
      
      console.log("Auth page: URL parameters -", { type, accessToken });

      if (type === 'recovery' && accessToken) {
        console.log("Auth page: Processing recovery token");
        try {
          const { data, error } = await supabase.auth.getSession();

          if (error) {
            console.error("Auth page: Recovery verification error -", error);
            setErrorMessage(t('error.invalid.recovery.link'));
            return;
          }

          if (data?.session) {
            console.log("Auth page: Recovery verification successful");
            setIsResetPasswordMode(true);
          }
        } catch (err) {
          console.error("Auth page: Recovery error -", err);
          setErrorMessage(t('error.invalid.recovery.link'));
        }
      }
    };

    handleRecoveryFlow();
  }, [language, searchParams, t, setVersion]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth page: Auth state changed:", event, session);
        
        if (event === "PASSWORD_RECOVERY") {
          console.log("Auth page: Password recovery event detected");
          setIsResetPasswordMode(true);
          return;
        }
        
        if (event === "SIGNED_IN" && session && !isResetPasswordMode) {
          console.log("Auth page: User signed in, navigating to home");
          navigate("/");
        } else if (event === "SIGNED_OUT") {
          console.log("Auth page: User signed out");
          setErrorMessage("");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate, isResetPasswordMode]);

  return (
    <div className="h-screen overflow-hidden auth-page flex">
      {/* Left side - Authentication content */}
      <div className="w-full md:w-1/2 flex flex-col h-screen p-4 md:p-8 bg-[#FFFFFF] dark:bg-[#1a1a1a]">
        <div className="flex-1 flex items-center justify-center w-full">
          <div className="w-full max-w-md space-y-8">
            <AuthForm 
              errorMessage={errorMessage} 
              isDarkMode={isDarkMode} 
              isResetPasswordMode={isResetPasswordMode} 
            />
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
            className="w-full h-full object-cover rounded-lg pointer-events-none"
            draggable="false"
            onContextMenu={(e) => e.preventDefault()}
          />
        </div>
      </div>
    </div>
  );
};

export default Auth;
