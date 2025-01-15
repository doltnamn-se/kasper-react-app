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

const Auth = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Preload both logo images
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
          setErrorMessage("Felaktigt användarnamn eller lösenord");
          break;
        case "Email not confirmed":
          setErrorMessage("Vänligen bekräfta din e-postadress innan du loggar in");
          break;
        case "User not found":
          setErrorMessage("Ingen användare hittades med dessa uppgifter");
          break;
        case "Invalid email or password":
          setErrorMessage("Ogiltig e-postadress eller lösenord");
          break;
        default:
          setErrorMessage("Ett fel uppstod. Försök igen senare.");
      }
    } else {
      setErrorMessage("Ett fel uppstod. Försök igen senare.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f6f4] dark:bg-[#161618] flex flex-col items-center justify-between p-4">
      <div className="w-full max-w-md space-y-8 mt-8">
        <div className="text-center space-y-6">
          <AuthLogo />
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-black dark:text-white">Välkommen tillbaka</h1>
            <p className="text-gray-600 dark:text-gray-400">Logga in på ditt konto</p>
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
                  email_label: 'E-postadress',
                  password_label: 'Lösenord',
                  email_input_placeholder: 'Din e-postadress',
                  password_input_placeholder: 'Ditt lösenord',
                  button_label: 'Logga in',
                  loading_button_label: 'Loggar in...',
                  social_provider_text: 'Logga in med {{provider}}',
                  link_text: 'Har du redan ett konto? Logga in',
                },
                sign_up: {
                  email_label: 'E-postadress',
                  password_label: 'Lösenord',
                  email_input_placeholder: 'Din e-postadress',
                  password_input_placeholder: 'Ditt lösenord',
                  button_label: 'Registrera',
                  loading_button_label: 'Registrerar...',
                  social_provider_text: 'Registrera med {{provider}}',
                  link_text: 'Har du inget konto? Registrera dig',
                },
                forgotten_password: {
                  email_label: 'E-postadress',
                  password_label: 'Lösenord',
                  email_input_placeholder: 'Din e-postadress',
                  button_label: 'Skicka återställningslänk',
                  loading_button_label: 'Skickar återställningslänk...',
                  link_text: 'Glömt lösenord?',
                },
                update_password: {
                  password_label: 'Nytt lösenord',
                  password_input_placeholder: 'Ditt nya lösenord',
                  button_label: 'Uppdatera lösenord',
                  loading_button_label: 'Uppdaterar lösenord...',
                },
                magic_link: {
                  email_input_label: 'E-postadress',
                  email_input_placeholder: 'Din e-postadress',
                  button_label: 'Skicka magisk länk',
                  loading_button_label: 'Skickar magisk länk...',
                  link_text: 'Skicka magisk länk via e-post',
                },
                verify_otp: {
                  email_input_label: 'E-postadress',
                  email_input_placeholder: 'Din e-postadress',
                  phone_input_label: 'Telefonnummer',
                  phone_input_placeholder: 'Ditt telefonnummer',
                  token_input_label: 'Token',
                  token_input_placeholder: 'Din engångskod',
                  button_label: 'Verifiera token',
                  loading_button_label: 'Verifierar...',
                }
              }
            }}
            providers={[]}
            view="sign_in"
            showLinks={false}
          />
          <div className="mt-6 text-center">
            <span className="text-gray-500 dark:text-gray-400">Har du inget konto?</span>
            {' '}
            <a 
              href="https://doltnamn.se/#planer" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-black hover:text-gray-700 dark:text-white dark:hover:text-gray-300 font-medium"
            >
              Registrera dig
            </a>
          </div>
        </div>

        <DarkModeToggle isDarkMode={isDarkMode} onToggle={toggleDarkMode} />
      </div>

      <AuthFooter />
    </div>
  );
};

export default Auth;