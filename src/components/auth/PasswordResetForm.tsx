import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PasswordResetFormProps {
  onCancel: () => void;
  initialError?: string;
}

export const PasswordResetForm = ({ onCancel, initialError }: PasswordResetFormProps) => {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(initialError);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(undefined);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?type=recovery`
      });

      if (resetError) {
        console.error("Error sending reset email:", resetError);
        setError(t('error.reset.email'));
        toast.error(t('error.reset.email'));
        return;
      }

      setIsSent(true);
      toast.success(t('reset.link.sent'));
    } catch (err) {
      console.error("Unexpected error:", err);
      setError(t('error.generic'));
      toast.error(t('error.generic'));
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <Alert className="mb-4">
        <AlertDescription>
          {t('reset.link.sent')}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full h-12 bg-transparent border-0 border-b border-[#e0e0e0] dark:border-[#3a3a3b] rounded-none text-black dark:text-white placeholder:text-[#000000A6] dark:placeholder:text-[#FFFFFFA6] font-medium pl-0"
          placeholder={t('email.placeholder')}
          required
        />
      </div>
      <div className="flex justify-between space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 h-12 bg-transparent border border-black dark:border-white text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-[4px] font-system-ui"
        >
          {t('cancel')}
        </button>
        <button
          type="submit"
          className="flex-1 h-12 bg-black hover:bg-[#333333] text-white dark:bg-white dark:text-black dark:hover:bg-[#cfcfcf] rounded-[4px] font-system-ui"
          disabled={isLoading}
        >
          {isLoading ? t('loading') : t('send.reset.link')}
        </button>
      </div>
    </form>
  );
};