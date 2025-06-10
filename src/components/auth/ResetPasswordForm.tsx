
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/checklist/password/PasswordInput";
import { PasswordRequirements, checkAllRequirements } from "@/components/checklist/password/PasswordRequirements";
import { useSearchParams, useLocation } from "react-router-dom";

interface ResetPasswordFormProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const ResetPasswordForm = ({ isLoading, setIsLoading }: ResetPasswordFormProps) => {
  const { t } = useLanguage();
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("ResetPasswordForm: Starting password update process");
    console.log("Current URL:", window.location.href);
    console.log("Search params:", Object.fromEntries(searchParams.entries()));
    console.log("Location state:", location.state);
    
    // Validate password requirements
    const allRequirementsMet = checkAllRequirements(newPassword, "", false);
    if (!allRequirementsMet) {
      toast.error(t('error.password.requirements'));
      return;
    }

    setIsLoading(true);

    try {
      // First, check if we have a current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log("Current session:", session);
      console.log("Session error:", sessionError);

      if (session) {
        console.log("Found existing session, updating password directly");
        // If we have a session, we can update the password directly
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
        
        // Sign out and redirect after successful password update
        await supabase.auth.signOut();
        window.location.href = '/auth?reset_success=true';
      } else {
        // Try to get tokens from URL for recovery flow
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const type = searchParams.get('type');
        
        console.log("No session found, checking URL tokens");
        console.log("Access token:", accessToken ? "present" : "missing");
        console.log("Refresh token:", refreshToken ? "present" : "missing");
        console.log("Type:", type);
        
        if (!accessToken && type === 'recovery') {
          console.error("No access token found in URL for recovery");
          toast.error(t('error.invalid.recovery.link'));
          return;
        }

        if (accessToken) {
          console.log("Setting session with tokens from URL");
          // Set the session with the tokens from URL
          const { data: { session: newSession }, error: setSessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });

          if (setSessionError || !newSession) {
            console.error("Error setting session:", setSessionError);
            toast.error(t('error.invalid.recovery.link'));
            return;
          }

          console.log("Session set successfully, now updating password");
          // Now update the password with the valid session
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
          
          // Sign out and redirect after successful password update
          await supabase.auth.signOut();
          window.location.href = '/auth?reset_success=true';
        } else {
          console.error("No valid session or tokens found");
          toast.error(t('error.invalid.recovery.link'));
        }
      }
    } catch (err) {
      console.error("Unexpected error:", err);
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
        className="w-full h-12 bg-black hover:bg-[#333333] text-white dark:bg-white dark:text-black dark:hover:bg-[#cfcfcf] rounded-[4px] font-system-ui"
        disabled={isLoading || !checkAllRequirements(newPassword, "", false)}
      >
        {isLoading ? t('loading') : t('update.password')}
      </Button>
    </form>
  );
};
