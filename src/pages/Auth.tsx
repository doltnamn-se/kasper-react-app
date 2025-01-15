import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { AuthError } from "@supabase/supabase-js";

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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Välkommen</h1>
          <p className="text-muted-foreground">Logga in på ditt konto</p>
        </div>
        
        {errorMessage && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <div className="bg-card p-6 rounded-lg shadow-sm">
          <SupabaseAuth 
            supabaseClient={supabase}
            appearance={{ 
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'rgb(var(--primary))',
                    brandAccent: 'rgb(var(--primary))',
                  },
                },
              },
              className: {
                anchor: 'hidden',
                button: 'hidden',
                container: 'hidden',
                divider: 'hidden',
                label: 'hidden',
                loader: 'hidden',
                message: 'hidden',
              },
            }}
            localization={{
              variables: {
                sign_in: {
                  email_label: 'E-postadress',
                  password_label: 'Lösenord',
                  button_label: 'Logga in',
                  loading_button_label: 'Loggar in...',
                  social_provider_text: 'Logga in med {{provider}}',
                  link_text: 'Har du redan ett konto? Logga in',
                }
              }
            }}
            theme="light"
            providers={[]}
            view="sign_in"
            showLinks={false}
          />
          <div className="mt-4 text-center space-x-2">
            <span className="text-muted-foreground">Har du inget konto?</span>
            <a 
              href="https://doltnamn.se/#planer" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              Bli medlem
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;