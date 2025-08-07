
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

interface PasswordResetFormProps {
  onCancel: () => void;
  initialError?: string | null;
}

export const PasswordResetForm = ({ onCancel, initialError }: PasswordResetFormProps) => {
  const { t } = useLanguage();
  const [resetEmail, setResetEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!resetEmail) {
      toast.error(t('error.missing.email'));
      return;
    }

    setIsLoading(true);
    console.log("Starting password reset process for email:", resetEmail);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth?type=recovery`
      });

      if (error) {
        console.error("Error in password reset:", error);
        toast.error(t('error.generic'));
        return;
      }

      console.log("Password reset email sent successfully");
      toast.success(t('reset.link.sent.title'), {
        description: t('reset.link.sent.description')
      });
      onCancel();
    } catch (err) {
      console.error("Error in password reset:", err);
      toast.error(t('error.generic'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center w-full">
      <div className="bg-transparent p-8 w-full max-w-sm fade-in rounded-[7px] font-system-ui">
        <h2 className="mb-3 text-left">
          {t('reset.your.password')}
        </h2>
        <p className="text-sm text-black dark:text-white mb-6 font-system-ui">
          {t('reset.password.subtitle')}
        </p>
        {initialError && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{initialError}</AlertDescription>
          </Alert>
        )}
        <div className="space-y-6">
          <div>
            <Input
              id="email"
              type="email"
              placeholder={t('email.placeholder')}
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="w-full h-12 bg-transparent border-0 border-b border-[#e0e0e0] dark:border-[#3a3a3b] rounded-none text-black dark:text-white placeholder:text-[#000000A6] dark:placeholder:text-[#FFFFFFA6] font-medium pl-0 placeholder:font-medium font-system-ui"
              disabled={isLoading}
            />
          </div>
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleResetPassword}
              className="w-full h-12 bg-black hover:bg-[#333333] text-white dark:bg-white dark:text-black dark:hover:bg-[#cfcfcf] rounded-[10px] font-system-ui"
              disabled={isLoading}
            >
              {isLoading ? t('sending.recovery.link') : t('send.recovery.link')}
            </Button>
            <Button
              onClick={onCancel}
              variant="outline"
              className="w-full h-12 rounded-[10px] font-system-ui"
              disabled={isLoading}
            >
              {t('cancel')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
