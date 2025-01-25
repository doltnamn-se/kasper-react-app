import { PasswordUpdateForm } from "../checklist/PasswordUpdateForm";
import { useToast } from "@/hooks/use-toast";

export const PasswordChange = () => {
  const { toast } = useToast();

  return (
    <PasswordUpdateForm 
      className="w-full"
      buttonClassName="w-1/2"
      onComplete={() => {
        toast({
          title: "Success",
          description: "Your password has been updated successfully.",
        });
      }} 
    />
  );
};