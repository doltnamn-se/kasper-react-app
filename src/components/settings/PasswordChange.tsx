import { PasswordUpdateForm } from "../checklist/PasswordUpdateForm";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

export const PasswordChange = () => {
  const { toast } = useToast();
  const { t } = useLanguage();

  return (
    <PasswordUpdateForm 
      className="w-full"
      buttonClassName="w-1/2"
      onComplete={() => {
        toast({
          title: t('success'),
          description: t('settings.password.updated'),
          variant: "default",
        });
      }} 
    />
  );
};