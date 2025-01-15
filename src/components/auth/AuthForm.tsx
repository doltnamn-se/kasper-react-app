import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLanguage } from "@/contexts/LanguageContext";
import { getAuthAppearance } from "./AuthAppearance";

interface AuthFormProps {
  errorMessage: string;
  isDarkMode: boolean;
}

export const AuthForm = ({ errorMessage, isDarkMode }: AuthFormProps) => {
  const { t } = useLanguage();

  return (
    <div className="bg-white dark:bg-[#232325] p-8 rounded-lg shadow-sm border border-gray-200 dark:border-[#303032]">
      {errorMessage && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <SupabaseAuth 
        supabaseClient={supabase}
        appearance={getAuthAppearance(isDarkMode)}
        providers={[]}
        view="sign_in"
        showLinks={false}
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
              link_text: t('already.have.account')
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
      />
      <div className="mt-4 text-center">
        <button
          onClick={() => supabase.auth.resetPasswordForEmail('')}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          {t('forgot.password')}
        </button>
      </div>
    </div>
  );
};