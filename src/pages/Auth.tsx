import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthError, AuthApiError } from "@supabase/supabase-js";
import { Switch } from "@/components/ui/switch";
import { Moon } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
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
        console.log("Auth state changed:", event, session);
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

    // Check if user is already signed in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleError = (error: AuthError) => {
    console.error("Auth error:", error);
    if (error instanceof AuthApiError) {
      switch (error.message) {
        case "Invalid login credentials":
          setErrorMessage("Felaktigt användarnamn eller lösenord");
          break;
        default:
          setErrorMessage("Ett fel uppstod. Försök igen senare.");
      }
    } else {
      setErrorMessage("Ett fel uppstod. Försök igen senare.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f6f4] dark:bg-[#161618] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-6">
          <svg width="120" height="24" viewBox="0 0 120 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto">
            <path d="M13.248 23.328C11.136 23.328 9.264 22.896 7.632 22.032C6.024 21.144 4.752 19.896 3.816 18.288C2.904 16.656 2.448 14.76 2.448 12.6C2.448 10.44 2.904 8.556 3.816 6.948C4.752 5.316 6.024 4.068 7.632 3.204C9.264 2.316 11.136 1.872 13.248 1.872C15.36 1.872 17.22 2.316 18.828 3.204C20.46 4.068 21.732 5.316 22.644 6.948C23.58 8.556 24.048 10.44 24.048 12.6C24.048 14.76 23.58 16.656 22.644 18.288C21.732 19.896 20.46 21.144 18.828 22.032C17.22 22.896 15.36 23.328 13.248 23.328ZM13.248 19.944C14.64 19.944 15.888 19.644 16.992 19.044C18.096 18.444 18.96 17.592 19.584 16.488C20.208 15.384 20.52 14.088 20.52 12.6C20.52 11.112 20.208 9.816 19.584 8.712C18.96 7.608 18.096 6.756 16.992 6.156C15.888 5.556 14.64 5.256 13.248 5.256C11.856 5.256 10.608 5.556 9.504 6.156C8.4 6.756 7.536 7.608 6.912 8.712C6.288 9.816 5.976 11.112 5.976 12.6C5.976 14.088 6.288 15.384 6.912 16.488C7.536 17.592 8.4 18.444 9.504 19.044C10.608 19.644 11.856 19.944 13.248 19.944ZM35.6539 23.328C33.5419 23.328 31.6699 22.896 30.0379 22.032C28.4299 21.144 27.1579 19.896 26.2219 18.288C25.3099 16.656 24.8539 14.76 24.8539 12.6C24.8539 10.44 25.3099 8.556 26.2219 6.948C27.1579 5.316 28.4299 4.068 30.0379 3.204C31.6699 2.316 33.5419 1.872 35.6539 1.872C37.7659 1.872 39.6259 2.316 41.2339 3.204C42.8659 4.068 44.1379 5.316 45.0499 6.948C45.9859 8.556 46.4539 10.44 46.4539 12.6C46.4539 14.76 45.9859 16.656 45.0499 18.288C44.1379 19.896 42.8659 21.144 41.2339 22.032C39.6259 22.896 37.7659 23.328 35.6539 23.328ZM35.6539 19.944C37.0459 19.944 38.2939 19.644 39.3979 19.044C40.5019 18.444 41.3659 17.592 41.9899 16.488C42.6139 15.384 42.9259 14.088 42.9259 12.6C42.9259 11.112 42.6139 9.816 41.9899 8.712C41.3659 7.608 40.5019 6.756 39.3979 6.156C38.2939 5.556 37.0459 5.256 35.6539 5.256C34.2619 5.256 33.0139 5.556 31.9099 6.156C30.8059 6.756 29.9419 7.608 29.3179 8.712C28.6939 9.816 28.3819 11.112 28.3819 12.6C28.3819 14.088 28.6939 15.384 29.3179 16.488C29.9419 17.592 30.8059 18.444 31.9099 19.044C33.0139 19.644 34.2619 19.944 35.6539 19.944ZM58.0598 23.328C55.9478 23.328 54.0758 22.896 52.4438 22.032C50.8358 21.144 49.5638 19.896 48.6278 18.288C47.7158 16.656 47.2598 14.76 47.2598 12.6C47.2598 10.44 47.7158 8.556 48.6278 6.948C49.5638 5.316 50.8358 4.068 52.4438 3.204C54.0758 2.316 55.9478 1.872 58.0598 1.872C60.1718 1.872 62.0318 2.316 63.6398 3.204C65.2718 4.068 66.5438 5.316 67.4558 6.948C68.3918 8.556 68.8598 10.44 68.8598 12.6C68.8598 14.76 68.3918 16.656 67.4558 18.288C66.5438 19.896 65.2718 21.144 63.6398 22.032C62.0318 22.896 60.1718 23.328 58.0598 23.328ZM58.0598 19.944C59.4518 19.944 60.6998 19.644 61.8038 19.044C62.9078 18.444 63.7718 17.592 64.3958 16.488C65.0198 15.384 65.3318 14.088 65.3318 12.6C65.3318 11.112 65.0198 9.816 64.3958 8.712C63.7718 7.608 62.9078 6.756 61.8038 6.156C60.6998 5.556 59.4518 5.256 58.0598 5.256C56.6678 5.256 55.4198 5.556 54.3158 6.156C53.2118 6.756 52.3478 7.608 51.7238 8.712C51.0998 9.816 50.7878 11.112 50.7878 12.6C50.7878 14.088 51.0998 15.384 51.7238 16.488C52.3478 17.592 53.2118 18.444 54.3158 19.044C55.4198 19.644 56.6678 19.944 58.0598 19.944ZM80.4657 23.328C78.3537 23.328 76.4817 22.896 74.8497 22.032C73.2417 21.144 71.9697 19.896 71.0337 18.288C70.1217 16.656 69.6657 14.76 69.6657 12.6C69.6657 10.44 70.1217 8.556 71.0337 6.948C71.9697 5.316 73.2417 4.068 74.8497 3.204C76.4817 2.316 78.3537 1.872 80.4657 1.872C82.5777 1.872 84.4377 2.316 86.0457 3.204C87.6777 4.068 88.9497 5.316 89.8617 6.948C90.7977 8.556 91.2657 10.44 91.2657 12.6C91.2657 14.76 90.7977 16.656 89.8617 18.288C88.9497 19.896 87.6777 21.144 86.0457 22.032C84.4377 22.896 82.5777 23.328 80.4657 23.328ZM80.4657 19.944C81.8577 19.944 83.1057 19.644 84.2097 19.044C85.3137 18.444 86.1777 17.592 86.8017 16.488C87.4257 15.384 87.7377 14.088 87.7377 12.6C87.7377 11.112 87.4257 9.816 86.8017 8.712C86.1777 7.608 85.3137 6.756 84.2097 6.156C83.1057 5.556 81.8577 5.256 80.4657 5.256C79.0737 5.256 77.8257 5.556 76.7217 6.156C75.6177 6.756 74.7537 7.608 74.1297 8.712C73.5057 9.816 73.1937 11.112 73.1937 12.6C73.1937 14.088 73.5057 15.384 74.1297 16.488C74.7537 17.592 75.6177 18.444 76.7217 19.044C77.8257 19.644 79.0737 19.944 80.4657 19.944ZM102.872 23.328C100.76 23.328 98.888 22.896 97.256 22.032C95.648 21.144 94.376 19.896 93.44 18.288C92.528 16.656 92.072 14.76 92.072 12.6C92.072 10.44 92.528 8.556 93.44 6.948C94.376 5.316 95.648 4.068 97.256 3.204C98.888 2.316 100.76 1.872 102.872 1.872C104.984 1.872 106.844 2.316 108.452 3.204C110.084 4.068 111.356 5.316 112.268 6.948C113.204 8.556 113.672 10.44 113.672 12.6C113.672 14.76 113.204 16.656 112.268 18.288C111.356 19.896 110.084 21.144 108.452 22.032C106.844 22.896 104.984 23.328 102.872 23.328ZM102.872 19.944C104.264 19.944 105.512 19.644 106.616 19.044C107.72 18.444 108.584 17.592 109.208 16.488C109.832 15.384 110.144 14.088 110.144 12.6C110.144 11.112 109.832 9.816 109.208 8.712C108.584 7.608 107.72 6.756 106.616 6.156C105.512 5.556 104.264 5.256 102.872 5.256C101.48 5.256 100.232 5.556 99.128 6.156C98.024 6.756 97.16 7.608 96.536 8.712C95.912 9.816 95.6 11.112 95.6 12.6C95.6 14.088 95.912 15.384 96.536 16.488C97.16 17.592 98.024 18.444 99.128 19.044C100.232 19.644 101.48 19.944 102.872 19.944Z" fill="currentColor"/>
          </svg>
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
                }
              },
              className: {
                anchor: 'text-black hover:text-gray-700 dark:text-white dark:hover:text-gray-300',
                button: 'bg-black hover:bg-gray-900 text-white font-medium py-2 px-4 rounded-lg dark:bg-white dark:text-black dark:hover:bg-gray-100',
                container: 'space-y-4',
                divider: 'my-4',
                label: 'text-sm font-medium text-gray-700 dark:text-gray-300',
                loader: 'border-black dark:border-white',
                message: 'text-red-600 dark:text-red-400',
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

        <div className="flex items-center justify-center gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <Moon className="w-5 h-5 text-[#4c4c49] dark:text-[#67676c] stroke-[1.5]" />
            <span className="text-sm text-[#1A1F2C] dark:text-slate-200">Mörkt läge</span>
          </div>
          <Switch
            checked={isDarkMode}
            onCheckedChange={toggleDarkMode}
            className="data-[state=checked]:bg-[#c3caf5] transition-colors duration-300"
          />
        </div>
      </div>
    </div>
  );
};

export default Auth;
