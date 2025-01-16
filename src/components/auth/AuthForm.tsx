import { useState } from "react";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLanguage } from "@/contexts/LanguageContext";
import { getAuthAppearance } from "./AuthAppearance";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

interface AuthFormProps {
  errorMessage: string;
  isDarkMode: boolean;
}

export const AuthForm = ({ errorMessage, isDarkMode }: AuthFormProps) => {
  const { t, language } = useLanguage();
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleResetPassword = async () => {
    if (!resetEmail) {
      toast.error(t('error.missing.email'));
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      console.error("Password reset error:", error);
      toast.error(error.message);
    } else {
      toast.success(t('reset.password.success'));
      setIsResetMode(false);
      setResetEmail("");
    }
  };

  if (isResetMode) {
    return (
      <div className="flex justify-center w-full">
        <div className="bg-white dark:bg-[#232325] p-8 border border-gray-200 dark:border-[#303032] w-full max-w-sm fade-in rounded-[7px] font-system-ui">
          <h2 className="text-xl font-semibold mb-6 text-center dark:text-white font-system-ui">
            {t('forgot.password')}
          </h2>
          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-bold text-gray-700 dark:text-gray-300 font-system-ui">
                {t('email')}
              </label>
              <Input
                id="email"
                type="email"
                placeholder={t('email.placeholder')}
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full h-12 bg-background dark:bg-[#3f3f46] dark:text-white dark:border-[#303032] dark:placeholder:text-gray-400 rounded-[4px] font-system-ui"
              />
            </div>
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleResetPassword}
                className="w-full h-12 bg-black hover:bg-gray-900 text-white dark:bg-white dark:text-black dark:hover:bg-[#cfcfcf] rounded-[4px] font-system-ui"
              >
                {t('send.recovery.link')}
              </Button>
              <Button
                onClick={() => setIsResetMode(false)}
                variant="outline"
                className="w-full h-12 rounded-[4px] font-system-ui"
              >
                {t('cancel')}
              </Button>
            </div>
          </div>
        </div>
      </div>
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
            input: "w-full h-12 bg-background dark:bg-[#3f3f46] dark:text-white dark:border-[#303032] dark:placeholder:text-gray-400 rounded-[4px] font-system-ui",
          },
          style: {
            ...getAuthAppearance(isDarkMode).style,
            input: {
              ...getAuthAppearance(isDarkMode).style.input,
              '&[type=password]': {
                fontFamily: 'text-security-disc',
                '-webkit-text-security': 'disc',
              }
            },
          }
        }}
        providers={[]}
        view="sign_in"
        showLinks={false}
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
      />
      <div className="mt-4 text-center">
        <button
          onClick={() => setIsResetMode(true)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 text-xs font-system-ui"
        >
          {t('forgot.password')}
        </button>
      </div>
      <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400 font-system-ui">
        {language === 'sv' ? "Har du inget konto? " : "Don't have an account? "}
        <a href="https://doltnamn.se/#planer" target="_blank" rel="noopener noreferrer" className="font-semibold text-black dark:text-white hover:underline font-system-ui">
          {language === 'sv' ? "Kom igång" : "Get started"}
        </a>
      </div>
    </div>
  );
};