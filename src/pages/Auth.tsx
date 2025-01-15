import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Home, Search } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

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

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      {/* Left Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-6 hidden md:block">
        <div className="space-y-6">
          <div className="flex items-center space-x-2 text-gray-700">
            <Home className="w-5 h-5" />
            <span className="font-medium">Home</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-700">
            <Search className="w-5 h-5" />
            <span className="font-medium">Search</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-gray-500">Sign in to your account</p>
          </div>
          
          {errorMessage && (
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <SupabaseAuth 
              supabaseClient={supabase}
              appearance={{ 
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#0F766E',
                      brandAccent: '#0D9488',
                      inputBackground: 'white',
                      inputBorder: '#E5E7EB',
                      inputBorderFocus: '#0F766E',
                      inputBorderHover: '#0F766E',
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
                className: {
                  anchor: 'text-teal-600 hover:text-teal-700',
                  button: 'bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg',
                  container: 'space-y-4',
                  divider: 'my-4',
                  label: 'text-sm font-medium text-gray-700',
                  loader: 'border-teal-600',
                  message: 'text-red-600',
                },
              }}
              localization={{
                variables: {
                  sign_in: {
                    email_label: 'Email address',
                    password_label: 'Password',
                    button_label: 'Sign in',
                    loading_button_label: 'Signing in...',
                    social_provider_text: 'Sign in with {{provider}}',
                    link_text: 'Already have an account? Sign in',
                  }
                }
              }}
              theme="light"
              providers={[]}
              view="sign_in"
              showLinks={false}
            />
            <div className="mt-6 text-center">
              <span className="text-gray-500">Don't have an account?</span>
              {' '}
              <a 
                href="https://doltnamn.se/#planer" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-teal-600 hover:text-teal-700 font-medium"
              >
                Sign up
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;