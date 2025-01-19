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
  const { t, language } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [recoveryToken, setRecoveryToken] = useState<string | null>(null);

  useEffect(() => {
    const initializeRecoveryFlow = async () => {
      if (!isResetPasswordMode) return;

      console.log("Initializing password recovery flow...");
      
      // First check URL hash for access_token
      const hash = window.location.hash;
      const hashParams = new URLSearchParams(hash.replace('#', ''));
      let token = hashParams.get('access_token');
      
      // If no token in hash, check query params
      if (!token) {
        const searchParams = new URLSearchParams(window.location.search);
        token = searchParams.get('token');
      }

      const type = new URLSearchParams(window.location.search).get('type');
      console.log("Recovery flow parameters:", { token: token ? "Found" : "Not found", type });

      if (!token || type !== 'recovery') {
        console.error("Invalid recovery flow parameters");
        toast.error(t('error.invalid.recovery.link'));
        return;
      }

      try {
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          toast.error(t('error.invalid.recovery.link'));
          return;
        }

        // If we have a session, verify it's valid for password recovery
        if (session?.access_token) {
          console.log("Session found, verifying recovery token");
          setRecoveryToken(session.access_token);
        } else {
          // If no session, try to exchange the recovery token
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'recovery'
          });

          if (verifyError) {
            console.error("Token verification error:", verifyError);
            toast.error(t('error.invalid.recovery.link'));
            return;
          }

          console.log("Recovery token verified successfully");
          setRecoveryToken(token);
        }
      } catch (err) {
        console.error("Error in recovery flow:", err);
        toast.error(t('error.invalid.recovery.link'));
      }
    };

    initializeRecoveryFlow();
  }, [isResetPasswordMode, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isResetPasswordMode) {
        if (!recoveryToken) {
          console.error("No recovery token available");
          toast.error(t('error.invalid.recovery.link'));
          return;
        }

        console.log("Updating password with recovery token");
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
        window.location.href = '/auth';
        return;
      }

      // Regular sign in flow
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
        <h2 className="text-xl font-bold mb-6 text-center dark:text-white font-system-ui font-[700]">
          {isResetPasswordMode 
            ? language === 'sv' ? "Återställ lösenord" : "Reset password"
            : t('sign.in')}
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
              className="w-full text-xs text-gray-600 hover:text-[#000000] hover:bg-transparent dark:text-gray-400 dark:hover:text-white font-normal"
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