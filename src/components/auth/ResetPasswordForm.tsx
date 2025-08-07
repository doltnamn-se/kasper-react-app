
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/checklist/password/PasswordInput";
import { PasswordRequirements, checkAllRequirements } from "@/components/checklist/password/PasswordRequirements";

interface ResetPasswordFormProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const ResetPasswordForm = ({ isLoading, setIsLoading }: ResetPasswordFormProps) => {
  const { t } = useLanguage();
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("ResetPasswordForm: Starting password update process");
    
    // Validate password requirements
    const allRequirementsMet = checkAllRequirements(newPassword, "", false);
    if (!allRequirementsMet) {
      toast.error(t('error.password.requirements'));
      return;
    }

    setIsLoading(true);

    try {
      // Check current session - should exist after recovery link verification
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log("Current session check:", session ? "exists" : "none", sessionError);

      if (!session) {
        console.error("No active session found for password reset");
        toast.error(t('error.invalid.recovery.link'));
        return;
      }

      console.log("Found valid session, updating password");
      
      // Update the password using the active session
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
      
      // Sign out after successful password update and redirect
      await supabase.auth.signOut();
      window.location.href = '/auth?reset_success=true';

    } catch (err) {
      console.error("Unexpected error in password reset:", err);
      toast.error(t('error.generic'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="w-full">
        <PasswordInput
          value={newPassword}
          onChange={setNewPassword}
          showPassword={showPassword}
          onToggleVisibility={() => setShowPassword(!showPassword)}
          placeholder={t('new.password.placeholder')}
        />
      </div>

      <PasswordRequirements
        password={newPassword}
        currentPassword=""
        showCurrentPassword={false}
      />

      <Button
        type="submit"
        className="w-full h-12 bg-black hover:bg-[#333333] text-white dark:bg-white dark:text-black dark:hover:bg-[#cfcfcf] rounded-[10px] font-system-ui"
        disabled={isLoading || !checkAllRequirements(newPassword, "", false)}
      >
        {isLoading ? t('loading') : t('update.password')}
      </Button>
    </form>
  );
};
