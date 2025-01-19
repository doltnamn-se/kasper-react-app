import { useState, useEffect } from "react";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLanguage } from "@/contexts/LanguageContext";
import { getAuthAppearance } from "./AuthAppearance";
import { PasswordResetForm } from "./PasswordResetForm";
import { SignUpPrompt } from "./SignUpPrompt";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface AuthFormProps {
  errorMessage: string;
  isDarkMode: boolean;
  isResetPasswordMode?: boolean;
}

export const AuthForm = ({ errorMessage, isDarkMode, isResetPasswordMode = false }: AuthFormProps) => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isManualResetMode, setIsManualResetMode] = useState(false);
  const [view, setView] = useState<"sign_in" | "update_password">("sign_in");
  const [resetError, setResetError] = useState<string | null>(null);

  useEffect(() => {
    const type = searchParams.get('type');
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    
    console.log("AuthForm: URL parameters -", { type, code, error, errorDescription });
    
    const handleRecoveryFlow = async () => {
      if (type === 'recovery' && code) {
        try {
          const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (sessionError) {
            console.error("AuthForm: Session error -", sessionError);
            setResetError(t('error.reset.link.expired'));
            toast.error(t('error.reset.link.expired'));
            setView("sign_in");
            setIsManualResetMode(true);
            return;
          }

          if (data.session) {
            console.log("AuthForm: Recovery session established");
            setView("update_password");
          }
        } catch (err) {
          console.error("AuthForm: Recovery flow error -", err);
          setResetError(t('error.reset.link.expired'));
          toast.error(t('error.reset.link.expired'));
          setView("sign_in");
          setIsManualResetMode(true);
        }
      }
    };

    handleRecoveryFlow();
  }, [searchParams, t, navigate]);

  // If we're in manual reset mode (from clicking forgot password), show the reset form
  if (isManualResetMode) {
    return (
      <PasswordResetForm 
        onCancel={() => {
          setIsManualResetMode(false);
          setResetError(null);
        }} 
        initialError={resetError}
      />
    );
  }

  return (
    <div className="bg-white dark:bg-[#232325] p-8 border border-gray-200 dark:border-[#303032] fade-in rounded-[7px] font-system-ui">
      {errorMessage && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <SupabaseAuth 
        supabaseClient={supabase}
        appearance={{
          ...getAuthAppearance(isDarkMode),
          className: {
            ...getAuthAppearance(isDarkMode).className,
            label: "text-sm font-bold text-gray-700 dark:text-gray-300 font-system-ui",
            container: "space-y-4 font-system-ui",
            button: "w-full h-12 bg-black hover:bg-gray-900 text-white dark:bg-white dark:text-black dark:hover:bg-[#cfcfcf] rounded-[4px] font-system-ui",
            input: "w-full h-12 bg-background dark:bg-[#3f3f46] dark:text-white dark:border-[#303032] dark:placeholder:text-gray-400 rounded-[4px] font-system-ui [&[type='password']]:font-['text-security-disc']",
          },
        }}
        providers={[]}
        view={view}
        showLinks={false}
        redirectTo={`${window.location.origin}/auth?type=recovery`}
        localization={{
          variables: {
            sign_in: {
              email_label: t('email'),
              password_label: t('password'),
              email_input_placeholder: t('email.placeholder'),
              password_input_placeholder: '••••••••',
              button_label: t('sign.in'),
              loading_button_label: t('signing.in'),
              social_provider_text: t('sign.in.with.provider'),
              link_text: t('already.have.account')
            },
            sign_up: {
              email_label: t('email'),
              password_label: t('password'),
              email_input_placeholder: t('email.placeholder'),
              password_input_placeholder: '••••••••',
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
              password_input_placeholder: '••••••••',
              button_label: t('update.password'),
              loading_button_label: t('updating.password'),
            },
          }
        }}
      />
      {view === "sign_in" && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setIsManualResetMode(true)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 text-xs font-system-ui"
          >
            {t('forgot.password')}
          </button>
        </div>
      )}
      {!isResetPasswordMode && <SignUpPrompt />}
    </div>
  );
};