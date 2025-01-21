import { useEffect, useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthSettings } from "@/components/auth/AuthSettings";
import { AuthFooter } from "@/components/auth/AuthFooter";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [errorMessage, setErrorMessage] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { t, language } = useLanguage();
  const [isResetPasswordMode, setIsResetPasswordMode] = useState(false);

  useEffect(() => {
    document.title = language === 'sv' ? 
      "Logga in | Doltnamn.se" : 
      "Log in | Doltnamn.se";

    const lightLogo = new Image();
    const darkLogo = new Image();
    lightLogo.src = "/lovable-uploads/a60e3543-e8d5-4f66-a2eb-97eeedd073ae.png";
    darkLogo.src = "/lovable-uploads/868b20a1-c3f1-404c-b8da-9d33fe738d9d.png";

    const isDark = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }

    // Handle recovery flow
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

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth page: Auth state changed:", event, session);
        
        if (event === "PASSWORD_RECOVERY") {
          console.log("Auth page: Password recovery event detected");
          setIsResetPasswordMode(true);
          return;
        }
        
        if (event === "SIGNED_IN" && session) {
          console.log("Auth page: User signed in, checking profile");
          try {
            const { data: profileData, error: profileError } = await supabase
              .from("profiles")
              .select("id, email, display_name, role")
              .eq("id", session.user.id)
              .maybeSingle();

            if (profileError) {
              console.error("Error fetching profile:", profileError);
            }

            if (!isResetPasswordMode) {
              console.log("Auth page: User signed in, navigating to home");
              navigate("/");
            }
          } catch (err) {
            console.error("Error in initUser:", err);
          }
        } else if (event === "SIGNED_OUT") {
          console.log("Auth page: User signed out");
          setErrorMessage("");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate, isResetPasswordMode]);

  return (
    <div className="min-h-screen bg-[#f6f6f4] dark:bg-[#161618] flex flex-col items-center justify-between p-4">
      <div className="w-full max-w-md space-y-8 mt-8">
        <AuthHeader />
        <AuthForm 
          errorMessage={errorMessage} 
          isDarkMode={isDarkMode} 
          isResetPasswordMode={isResetPasswordMode} 
        />
        <AuthSettings isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />
      </div>
      <AuthFooter />
    </div>
  );
};

export default Auth;