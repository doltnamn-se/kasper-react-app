import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Settings = () => {
  const { t } = useLanguage();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError(t('error.passwords.dont.match'));
      return;
    }

    if (newPassword.length < 6) {
      setError(t('error.password.too.short'));
      return;
    }

    setIsLoading(true);
    console.log("Attempting to update password...");

    try {
      const { error } = await supabase.auth.updateUser({ 
        password: newPassword 
      });

      if (error) {
        console.error("Error updating password:", error);
        setError(error.message);
        return;
      }

      console.log("Password updated successfully");
      toast.success(t('settings.password.updated'));
      
      // Clear form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Error in password update:", err);
      setError(t('error.generic'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-md">
        <h1 className="text-2xl font-bold tracking-[-.416px] text-[#000000] dark:text-white mb-6">
          {t('profile.settings')}
        </h1>
        <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[7px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
          <h2 className="text-xl font-semibold mb-6 dark:text-white">
            {t('settings.change.password')}
          </h2>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4">
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
        </div>
      </div>
    </MainLayout>
  );
};

export default Settings;