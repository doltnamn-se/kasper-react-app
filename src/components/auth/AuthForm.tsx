import { useState } from "react";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLanguage } from "@/contexts/LanguageContext";
import { getAuthAppearance } from "./AuthAppearance";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

interface AuthFormProps {
  errorMessage: string;
  isDarkMode: boolean;
  isResetPasswordMode?: boolean;
}

export const AuthForm = ({ errorMessage, isDarkMode, isResetPasswordMode }: AuthFormProps) => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const handleMagicLinkSubmit = async (email: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/checklist`,
        },
      });

      if (error) {
        console.error("Magic link error:", error);
        if (error.message?.includes("Email rate limit exceeded")) {
          toast.error(t('error.email.rate.limit'));
        } else {
          toast.error(t('error.generic'));
        }
        return;
      }

      toast.success(t('magic.link.sent'));
    } catch (err) {
      console.error("Error in magic link flow:", err);
      toast.error(t('error.generic'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#232325] p-8 border border-gray-200 dark:border-[#303032] fade-in rounded-[7px] font-system-ui">
      {errorMessage && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold dark:text-white">
            {t('welcome.back')}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('enter.email.for.magic.link')}
          </p>
        </div>

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
          }}
          view="magic_link"
          showLinks={false}
          providers={[]}
          redirectTo={`${window.location.origin}/checklist`}
          localization={{
            variables: {
              magic_link: {
                email_input_label: t('email'),
                email_input_placeholder: t('email.placeholder'),
                button_label: t('send.magic.link'),
                loading_button_label: t('sending.magic.link'),
                link_text: t('send.magic.link.via.email'),
              }
            }
          }}
        />
      </div>
    </div>
  );
};