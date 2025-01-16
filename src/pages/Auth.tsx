import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AuthError, AuthApiError } from "@supabase/supabase-js";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthSettings } from "@/components/auth/AuthSettings";
import { AuthFooter } from "@/components/auth/AuthFooter";
import { useLanguage } from "@/contexts/LanguageContext";

const Auth = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { t, language } = useLanguage();

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
  }, [language]);

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
        if (event === "SIGNED_IN" && session) {
          navigate("/");
        }
        if (event === "SIGNED_OUT") {
          setErrorMessage("");
        }
        if (event === "PASSWORD_RECOVERY") {
          const { error } = await supabase.auth.getSession();
          if (error) {
            handleError(error);
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleError = (error: AuthError) => {
    console.error("Auth error:", error);
    if (error instanceof AuthApiError) {
      switch (error.message) {
        case "Invalid login credentials":
          setErrorMessage(t('error.invalid.credentials'));
          break;
        case "Email not confirmed":
          setErrorMessage(t('error.email.not.confirmed'));
          break;
        case "User not found":
          setErrorMessage(t('error.user.not.found'));
          break;
        case "Invalid email or password":
          setErrorMessage(t('error.invalid.email.password'));
          break;
        case "missing email or phone":
          setErrorMessage(t('error.missing.email.phone'));
          break;
        case "missing password":
          setErrorMessage(t('error.missing.password'));
          break;
        case "password too short":
          setErrorMessage(t('error.password.too.short'));
          break;
        case "email already taken":
          setErrorMessage(t('error.email.taken'));
          break;
        case "phone number already taken":
          setErrorMessage(t('error.phone.taken'));
          break;
        case "weak password":
          setErrorMessage(t('error.weak.password'));
          break;
        case "invalid email":
          setErrorMessage(t('error.invalid.email'));
          break;
        case "invalid phone":
          setErrorMessage(t('error.invalid.phone'));
          break;
        default:
          setErrorMessage(t('error.generic'));
      }
    } else {
      setErrorMessage(t('error.generic'));
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f6f4] dark:bg-[#161618] flex flex-col items-center justify-between p-4">
      <div className="w-full max-w-md space-y-8 mt-8">
        <AuthHeader />
        <AuthForm errorMessage={errorMessage} isDarkMode={isDarkMode} />
        <AuthSettings isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />
      </div>
      <AuthFooter />
    </div>
  );
};

export default Auth;