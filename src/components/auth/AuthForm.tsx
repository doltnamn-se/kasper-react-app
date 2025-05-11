
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PasswordResetForm } from "./PasswordResetForm";
import { SignUpPrompt } from "./SignUpPrompt";
import { useSearchParams } from "react-router-dom";
import { LoginForm } from "./LoginForm";
import { ResetPasswordForm } from "./ResetPasswordForm";
import { AuthEyeLogo } from "./AuthEyeLogo";

interface AuthFormProps {
  errorMessage?: string;
  isDarkMode?: boolean;
  isResetPasswordMode?: boolean;
}

export const AuthForm = ({ 
  errorMessage, 
  isDarkMode, 
  isResetPasswordMode: propIsResetPasswordMode 
}: AuthFormProps) => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [isResetPasswordMode, setIsResetPasswordMode] = useState(propIsResetPasswordMode);

  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'recovery') {
      console.log("Recovery mode detected from URL");
      setIsResetPasswordMode(true);
    }
  }, [searchParams]);

  const showResetSuccess = searchParams.get('reset_success') === 'true';

  if (showResetForm) {
    return <PasswordResetForm onCancel={() => setShowResetForm(false)} initialError={errorMessage} />;
  }

  return (
    <div className="flex justify-center w-full">
      <div className="bg-white/30 dark:bg-[#232325]/30 backdrop-blur-xl backdrop-saturate-150 p-8 border border-white/20 dark:border-[#303032]/20 w-full max-w-sm fade-in rounded-[7px] font-system-ui">
        <AuthEyeLogo />
        <h2 className="text-xl font-bold mb-10 text-left dark:text-white font-system-ui font-[700]">
          {isResetPasswordMode ? t('reset.password') : t('sign.in')}
        </h2>
        
        {errorMessage && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {showResetSuccess && (
          <Alert className="mb-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900/50">
            <AlertDescription className="text-green-800 dark:text-green-200">
              {t('password.updated')}
            </AlertDescription>
          </Alert>
        )}

        {isResetPasswordMode ? (
          <ResetPasswordForm 
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        ) : (
          <>
            <LoginForm
              onForgotPassword={() => setShowResetForm(true)}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
            {!isResetPasswordMode && !showResetForm && <SignUpPrompt />}
          </>
        )}
      </div>
    </div>
  );
};
