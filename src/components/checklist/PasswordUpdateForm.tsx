import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Check } from "lucide-react";
import { PasswordInput } from "./password/PasswordInput";
import { PasswordRequirements, checkAllRequirements } from "./password/PasswordRequirements";
import { useChecklistSteps } from "@/hooks/useChecklistSteps";

interface PasswordUpdateFormProps {
  onComplete: () => void;
  className?: string;
  buttonClassName?: string;
  buttonText?: string;
  showCurrentPassword?: boolean;
  showSuccessToast?: boolean;
  showSuccessAnimation?: boolean;
}

export const PasswordUpdateForm = ({ 
  onComplete, 
  className = "w-full",
  buttonClassName = "w-full",
  buttonText,
  showCurrentPassword = false,
  showSuccessToast = false,
  showSuccessAnimation = false
}: PasswordUpdateFormProps) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrentPasswordField, setShowCurrentPasswordField] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { t, language } = useLanguage();
  const { handleStepChange } = useChecklistSteps();

  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setShowPassword(false);
    setShowCurrentPasswordField(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const allRequirementsMet = checkAllRequirements(newPassword, currentPassword, showCurrentPassword);
      
      if (!allRequirementsMet) {
        console.error('Password requirements not met');
        setIsLoading(false);
        return;
      }

      if (showCurrentPassword) {
        console.log("Verifying current password...");
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: (await supabase.auth.getUser()).data.user?.email || '',
          password: currentPassword,
        });

        if (signInError) {
          console.error("Current password verification failed:", signInError);
          setIsLoading(false);
          return;
        }
        console.log("Current password verified successfully");
      }

      console.log("Attempting to update password...");
      const { error } = await supabase.auth.updateUser({ 
        password: newPassword
      });

      if (error) {
        console.error("Password update error:", error);
        if (error.message.includes('same_password')) {
          console.error("New password must be different from current password");
          setIsLoading(false);
          return;
        }
        throw error;
      }

      console.log("Password updated successfully, updating checklist progress...");
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('No user session');

      const { error: updateError } = await supabase
        .from('customer_checklist_progress')
        .update({ password_updated: true })
        .eq('customer_id', session.user.id);

      if (updateError) {
        console.error("Error updating checklist progress:", updateError);
        throw updateError;
      }

      console.log("Checklist progress updated successfully");
      resetForm();
      onComplete();
      
      // Navigate to the next step after successful password update
      handleStepChange(2);
    } catch (error) {
      console.error('Error in password update flow:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 w-full">
      <div className={`w-full ${className}`}>
        {showCurrentPassword && (
          <div className="mb-8 w-full">
            <PasswordInput
              value={currentPassword}
              onChange={setCurrentPassword}
              showPassword={showCurrentPasswordField}
              onToggleVisibility={() => setShowCurrentPasswordField(!showCurrentPasswordField)}
              placeholder={t('current.password')}
            />
          </div>
        )}
        <PasswordInput
          value={newPassword}
          onChange={setNewPassword}
          showPassword={showPassword}
          onToggleVisibility={() => setShowPassword(!showPassword)}
          placeholder={t('new.password')}
        />
      </div>

      <PasswordRequirements
        password={newPassword}
        currentPassword={currentPassword}
        showCurrentPassword={showCurrentPassword}
      />

      <Button 
        type="submit" 
        disabled={isLoading || !checkAllRequirements(newPassword, currentPassword, showCurrentPassword)} 
        className={`h-12 ${buttonClassName}`}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          <span
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
              showSuccessAnimation ? 'opacity-0' : 'opacity-100'
            }`}
          >
            {isLoading ? t('updating.password') : buttonText || t('update.password')}
          </span>
          
          <Check 
            className={`absolute inset-0 m-auto h-6 w-6 transition-opacity duration-200 ${
              showSuccessAnimation ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </div>
      </Button>
    </form>
  );
};