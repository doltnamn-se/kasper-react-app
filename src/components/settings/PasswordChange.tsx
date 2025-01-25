import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const PasswordChange = () => {
  const { t } = useLanguage();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
    setIsLoading(false);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      console.log("Auth state changed:", event);
      if (event === 'USER_UPDATED') {
        toast({
          title: t('settings.success'),
          description: t('settings.password.updated'),
        });
        resetForm();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [t]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (newPassword !== confirmPassword) {
      setError(t('error.passwords.dont.match'));
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError(t('error.password.too.short'));
      setIsLoading(false);
      return;
    }

    try {
      console.log("Attempting to update password...");
      const { error } = await supabase.auth.updateUser({ 
        password: newPassword 
      });

      if (error) {
        console.error("Error updating password:", error);
        setError(error.message);
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Error in password update:", err);
      setError(t('error.generic'));
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handlePasswordChange} className="space-y-4">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <label htmlFor="currentPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('settings.current.password')}
        </label>
        <Input
          id="currentPassword"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full h-12"
          disabled={isLoading}
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="newPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('settings.new.password')}
        </label>
        <Input
          id="newPassword"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full h-12"
          disabled={isLoading}
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('settings.confirm.password')}
        </label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full h-12"
          disabled={isLoading}
          required
        />
      </div>

      <Button 
        type="submit" 
        className="w-full h-12 bg-black hover:bg-black/90 text-white"
        disabled={isLoading}
      >
        {isLoading ? t('settings.updating.password') : t('settings.update.password')}
      </Button>
    </form>
  );
};