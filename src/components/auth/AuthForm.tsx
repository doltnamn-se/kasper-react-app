
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PasswordResetForm } from "./PasswordResetForm";
import { SignUpPrompt } from "./SignUpPrompt";
import { useSearchParams } from "react-router-dom";
import { LoginForm } from "./LoginForm";
import { ResetPasswordForm } from "./ResetPasswordForm";
import { AuthEyeLogo } from "./AuthEyeLogo";
import { AnnouncementBadge } from "@/components/AnnouncementBadge";
import { isIOS } from "@/capacitor";

interface AuthFormProps {
  errorMessage?: string;
  isDarkMode?: boolean;
  isResetPasswordMode?: boolean;
  onShowPricingTable: () => void;
}

export const AuthForm = ({ 
  errorMessage, 
  isDarkMode, 
  isResetPasswordMode: propIsResetPasswordMode,
  onShowPricingTable
}: AuthFormProps) => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [isResetPasswordMode, setIsResetPasswordMode] = useState(propIsResetPasswordMode);
  const [isInputFocused, setIsInputFocused] = useState(false);

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
      <div className="bg-transparent p-8 w-full max-w-sm fade-in rounded-[7px] font-system-ui">
        <div className={`transition-opacity duration-300 ease-out ${isInputFocused ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 animate-fade-in'}`} style={{ willChange: 'opacity' }}>
          <AuthEyeLogo />
          <h2 className="mb-10 text-left">
            {isResetPasswordMode ? t('reset.password') : t('sign.in')}
          </h2>
        </div>
        
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
            <div className={`transition-transform duration-300 ease-out ${isInputFocused ? '-translate-y-12' : 'translate-y-0'}`} style={{ willChange: 'transform' }}>
              <LoginForm
                onForgotPassword={() => setShowResetForm(true)}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                onInputFocus={() => setIsInputFocused(true)}
                onInputBlur={() => setIsInputFocused(false)}
              />
            </div>
            {!isResetPasswordMode && !showResetForm && !isIOS() && <SignUpPrompt onGetStarted={onShowPricingTable} />}
          </>
        )}
      </div>
    </div>
  );
};
