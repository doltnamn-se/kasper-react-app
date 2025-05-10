
import { useEffect, useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthSettings } from "@/components/auth/AuthSettings";
import { AuthFooter } from "@/components/auth/AuthFooter";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { initializeVersionTracking, useVersionStore } from "@/config/version";
import { getLatestVersion } from "@/utils/versionUtils";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [errorMessage, setErrorMessage] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { t, language } = useLanguage();
  const [isResetPasswordMode, setIsResetPasswordMode] = useState(false);
  const setVersion = useVersionStore((state) => state.setVersion);
  const [versionInitialized, setVersionInitialized] = useState(false);

  useEffect(() => {
    document.title = language === 'sv' ? 
      "Logga in | Digitaltskydd.se" : 
      "Log in | Digitaltskydd.se";

    const lightLogo = new Image();
    const darkLogo = new Image();
    lightLogo.src = "/lovable-uploads/a60e3543-e8d5-4f66-a2eb-97eeedd073ae.png";
    darkLogo.src = "/lovable-uploads/868b20a1-c3f1-404c-b8da-9d33fe738d9d.png";

    const isDark = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }

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
    <div className="min-h-screen auth-page flex">
      {/* Left side - Authentication content */}
      <div className="w-full md:w-1/2 flex flex-col min-h-screen bg-[#FFFFFF] dark:bg-[#121212]">
        <div className="pt-16 px-6 md:px-16">
          <AuthHeader />
        </div>
        <div className="flex-1 flex items-center justify-center w-full px-6 md:px-16">
          <div className="w-full space-y-8 max-w-md">
            <AuthForm 
              errorMessage={errorMessage} 
              isDarkMode={isDarkMode} 
              isResetPasswordMode={isResetPasswordMode} 
            />
            <AuthSettings isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />
          </div>
        </div>
        <div className="pb-5 px-6 md:px-16">
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

export default Auth;
