import { PasswordUpdateForm } from "../checklist/PasswordUpdateForm";
import { useToast } from "@/hooks/use-toast";

export const PasswordChange = () => {
  const { toast } = useToast();

  return (
    <PasswordUpdateForm 
      onComplete={() => {
        toast({
          title: "Success",
          description: "Your password has been updated successfully.",
        });
      }} 
    />
  );
};