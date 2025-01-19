import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PasswordResetForm } from "./PasswordResetForm";
import { SignUpPrompt } from "./SignUpPrompt";

interface AuthFormProps {
  errorMessage?: string;
  isDarkMode?: boolean;
  isResetPasswordMode?: boolean;
}

export const AuthForm = ({ errorMessage, isDarkMode, isResetPasswordMode }: AuthFormProps) => {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [recoveryToken, setRecoveryToken] = useState<string | null>(null);

  useEffect(() => {
    if (isResetPasswordMode) {
      const fullUrl = window.location.href;
      console.log("Full URL:", fullUrl);
      
      // Extract the code from query parameters instead of hash
      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get('code');
      const type = searchParams.get('type');
      
      if (code && type === 'recovery') {
        console.log("Found recovery code in URL");
        setRecoveryToken(code);
      } else {
        console.error("No recovery code found in URL or invalid type. Full URL for debugging:", fullUrl);
      }
    }
  }, [isResetPasswordMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isResetPasswordMode) {
        console.log("Starting password reset process");
        
        if (!recoveryToken) {
          console.error("No recovery token found");
          toast.error(t('error.generic'));
          return;
        }

        // Update the user's password using the recovery token
        const { error: updateError } = await supabase.auth.updateUser({
          password: newPassword
        });

        if (updateError) {
          console.error("Error updating password:", updateError);
          toast.error(t('error.password.update'));
          return;
        }

        console.log("Password updated successfully");
        toast.success(t('password.updated'));
        
        // Redirect to login after successful password update
        window.location.href = '/auth';
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Sign in error:", error);
        toast.error(t('error.signin'));
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error(t('error.generic'));
    } finally {
      setIsLoading(false);
    }
  };

  if (showResetForm) {
    return <PasswordResetForm onCancel={() => setShowResetForm(false)} initialError={errorMessage} />;
  }

  return (
    <div className="flex justify-center w-full">
      <div className="bg-white dark:bg-[#232325] p-8 border border-gray-200 dark:border-[#303032] w-full max-w-sm fade-in rounded-[7px] font-system-ui">
        <h2 className="text-xl font-bold mb-6 text-center dark:text-white font-system-ui">
          {isResetPasswordMode ? t('reset.password') : t('sign.in')}
        </h2>
        
        {errorMessage && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {isResetPasswordMode ? (
            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-bold text-gray-700 dark:text-gray-300 font-system-ui">
                {t('new.password')}
              </label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full h-12 bg-background dark:bg-[#3f3f46] dark:text-white dark:border-[#303032] dark:placeholder:text-gray-400 rounded-[4px] font-system-ui"
                placeholder={t('new.password.placeholder')}
                disabled={isLoading}
                required
                minLength={6}
              />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-bold text-gray-700 dark:text-gray-300 font-system-ui">
                  {t('email')}
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 bg-background dark:bg-[#3f3f46] dark:text-white dark:border-[#303032] dark:placeholder:text-gray-400 rounded-[4px] font-system-ui"
                  placeholder={t('email.placeholder')}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-bold text-gray-700 dark:text-gray-300 font-system-ui">
                  {t('password')}
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 bg-background dark:bg-[#3f3f46] dark:text-white dark:border-[#303032] dark:placeholder:text-gray-400 rounded-[4px] font-system-ui"
                  placeholder={t('password.placeholder')}
                  disabled={isLoading}
                  required
                />
              </div>
            </>
          )}

          <Button
            type="submit"
            className="w-full h-12 bg-black hover:bg-[#333333] text-white dark:bg-white dark:text-black dark:hover:bg-[#cfcfcf] rounded-[4px] font-system-ui"
            disabled={isLoading}
          >
            {isLoading ? t('loading') : isResetPasswordMode ? t('update.password') : t('sign.in')}
          </Button>

          {!isResetPasswordMode && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowResetForm(true)}
              className="w-full text-xs text-gray-600 hover:text-black hover:bg-transparent dark:text-gray-400 dark:hover:text-white font-normal"
            >
              {t('forgot.password')}
            </Button>
          )}
        </form>
        <SignUpPrompt />
      </div>
    </div>
  );
};