import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { EyeIcon, EyeOffIcon } from "lucide-react";

interface PasswordUpdateFormProps {
  onComplete: () => void;
  className?: string;
  buttonClassName?: string;
  buttonText?: string;
  showCurrentPassword?: boolean;
}

export const PasswordUpdateForm = ({ 
  onComplete, 
  className = "lg:w-[75%] xl:w-1/2",
  buttonClassName = "w-full",
  buttonText,
  showCurrentPassword = false
}: PasswordUpdateFormProps) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPasswordField, setShowCurrentPasswordField] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (showCurrentPassword) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: (await supabase.auth.getUser()).data.user?.email || '',
          password: currentPassword,
        });

        if (signInError) {
          setError(t('error.invalid.credentials'));
          setIsLoading(false);
          return;
        }
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        onComplete();
        setNewPassword("");
        setCurrentPassword("");
      }
    } catch (err) {
      setError(t('error.password.update'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      {error && (
        <div className="text-red-500 text-sm mb-4">
          {error}
        </div>
      )}

      {showCurrentPassword && (
        <div className="space-y-2 mb-4">
          <label
            htmlFor="currentPassword"
            className="block text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            {t('settings.current.password')}
          </label>
          <div className="relative">
            <Input
              id="currentPassword"
              type={showCurrentPasswordField ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="pr-10"
              placeholder={t('password.placeholder')}
              required
            />
            <button
              type="button"
              onClick={() => setShowCurrentPasswordField(!showCurrentPasswordField)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {showCurrentPasswordField ? (
                <EyeOffIcon className="h-4 w-4 text-gray-500" />
              ) : (
                <EyeIcon className="h-4 w-4 text-gray-500" />
              )}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2 mb-4">
        <label
          htmlFor="newPassword"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          {t('new.password')}
        </label>
        <div className="relative">
          <Input
            id="newPassword"
            type={showPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="pr-10"
            placeholder={t('new.password.placeholder')}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            {showPassword ? (
              <EyeOffIcon className="h-4 w-4 text-gray-500" />
            ) : (
              <EyeIcon className="h-4 w-4 text-gray-500" />
            )}
          </button>
        </div>
      </div>

      <Button 
        type="submit" 
        disabled={isLoading} 
        className={`h-12 ${buttonClassName}`}
      >
        {isLoading ? t('updating.password') : buttonText || t('update.password')}
      </Button>
    </form>
  );
};