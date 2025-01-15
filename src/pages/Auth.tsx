import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthError, AuthApiError } from "@supabase/supabase-js";
import { AuthLogo } from "@/components/auth/AuthLogo";
import { DarkModeToggle } from "@/components/auth/DarkModeToggle";
import { AuthFooter } from "@/components/auth/AuthFooter";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { useLanguage } from "@/contexts/LanguageContext";

const Auth = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const lightLogo = new Image();
    const darkLogo = new Image();
    lightLogo.src = "/lovable-uploads/a60e3543-e8d5-4f66-a2eb-97eeedd073ae.png";
    darkLogo.src = "/lovable-uploads/868b20a1-c3f1-404c-b8da-9d33fe738d9d.png";

    const isDark = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

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
        <div className="text-center space-y-6">
          <AuthLogo />
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-black dark:text-white">{t('welcome.back')}</h1>
            <p className="text-gray-600 dark:text-gray-400">{t('sign.in')}</p>
          </div>
        </div>
        
        {errorMessage && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <div className="bg-white dark:bg-[#232325] p-8 rounded-lg shadow-sm border border-gray-200 dark:border-[#303032]">
          <SupabaseAuth 
            supabaseClient={supabase}
            appearance={{ 
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#000000',
                    brandAccent: '#333333',
                    inputBackground: 'white',
                    inputBorder: '#E5E7EB',
                    inputBorderFocus: '#000000',
                    inputBorderHover: '#000000',
                    messageText: '#ff6369',
                    messageBackground: '#ff22221e',
                    messageTextDanger: '#ff6369',
                  },
                  borderWidths: {
                    buttonBorderWidth: '1px',
                    inputBorderWidth: '1px',
                  },
                  radii: {
                    borderRadiusButton: '0.5rem',
                    buttonBorderRadius: '0.5rem',
                    inputBorderRadius: '0.5rem',
                  },
                },
              },
              style: {
                input: {
                  backgroundColor: isDarkMode ? '#3f3f46' : 'white',
                  color: isDarkMode ? '#fff' : '#6B7280',
                  borderColor: isDarkMode ? '#303032' : '#E5E7EB',
                },
                message: {
                  backgroundColor: '#ff22221e',
                  border: 'none',
                  color: '#ff6369',
                  fontWeight: 600,
                  padding: '12px 16px',
                  borderRadius: '0.5rem',
                }
              },
              className: {
                anchor: 'text-black hover:text-gray-700 dark:text-white dark:hover:text-gray-300',
                button: 'bg-black hover:bg-gray-900 text-white font-medium py-2 px-4 rounded-lg dark:bg-white dark:text-black dark:hover:bg-gray-100',
                container: 'space-y-4',
                divider: 'my-4',
                label: 'text-sm font-medium text-gray-700 dark:text-gray-300',
                loader: 'border-black dark:border-white',
                message: 'text-[#ff6369] bg-[#ff22221e]',
              },
            }}
            localization={{
              variables: {
                sign_in: {
                  email_label: t('email'),
                  password_label: t('password'),
                  email_input_placeholder: t('email.placeholder'),
                  password_input_placeholder: t('password.placeholder'),
                  button_label: t('sign.in'),
                  loading_button_label: t('signing.in'),
                  social_provider_text: t('sign.in.with.provider'),
                  link_text: t('already.have.account'),
                },
                sign_up: {
                  email_label: t('email'),
                  password_label: t('password'),
                  email_input_placeholder: t('email.placeholder'),
                  password_input_placeholder: t('password.placeholder'),
                  button_label: t('register'),
                  loading_button_label: t('registering'),
                  social_provider_text: t('register.with.provider'),
                  link_text: t('no.account'),
                },
                forgotten_password: {
                  email_label: t('email'),
                  password_label: t('password'),
                  email_input_placeholder: t('email.placeholder'),
                  button_label: t('send.recovery.link'),
                  loading_button_label: t('sending.recovery.link'),
                  link_text: t('forgot.password'),
                },
                update_password: {
                  password_label: t('new.password'),
                  password_input_placeholder: t('new.password.placeholder'),
                  button_label: t('update.password'),
                  loading_button_label: t('updating.password'),
                },
                magic_link: {
                  email_input_label: t('email'),
                  email_input_placeholder: t('email.placeholder'),
                  button_label: t('send.magic.link'),
                  loading_button_label: t('sending.magic.link'),
                  link_text: t('send.magic.link.via.email'),
                },
                verify_otp: {
                  email_input_label: t('email'),
                  email_input_placeholder: t('email.placeholder'),
                  phone_input_label: t('phone'),
                  phone_input_placeholder: t('phone.placeholder'),
                  token_input_label: t('token'),
                  token_input_placeholder: t('token.placeholder'),
                  button_label: t('verify.token'),
                  loading_button_label: t('verifying.token'),
                }
              }
            }}
            providers={[]}
            view="sign_in"
            showLinks={false}
          />
          <div className="mt-6 text-center">
            <span className="text-gray-500 dark:text-gray-400">{t('no.account')}</span>
            {' '}
            <a 
              href="https://doltnamn.se/#planer" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-black hover:text-gray-700 dark:text-white dark:hover:text-gray-300 font-medium"
            >
              {t('register')}
            </a>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 mt-6">
          <DarkModeToggle isDarkMode={isDarkMode} onToggle={toggleDarkMode} />
          <LanguageSwitch />
        </div>
      </div>

      <AuthFooter />
    </div>
  );
};

export default Auth;
