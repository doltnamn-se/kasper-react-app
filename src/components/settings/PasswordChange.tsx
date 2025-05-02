
import { useState } from "react";
import { PasswordUpdateForm } from "../checklist/PasswordUpdateForm";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

export const PasswordChange = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSuccess = async () => {
    setShowSuccess(true);
    
    // Wait for the animation sequence to complete before resetting
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setShowSuccess(false);
  };

  return (
    <PasswordUpdateForm 
      className="w-full"
      buttonClassName="w-1/2 relative"
      buttonText={t('settings.change.password')}
      showCurrentPassword={true}
      showSuccessToast={true}
      showSuccessAnimation={showSuccess}
      onComplete={async () => {
        await handleSuccess();
        toast({
          title: t('success'),
          description: t('settings.password.updated'),
          variant: "default",
        });
      }} 
    />
  );
};
