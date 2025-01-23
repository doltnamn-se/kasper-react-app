import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface PasswordUpdateFormProps {
  onComplete: () => void;
}

export const PasswordUpdateForm = ({ onComplete }: PasswordUpdateFormProps) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (newPassword !== confirmPassword) {
        toast({
          variant: "destructive",
          title: t('error.passwords.dont.match'),
          description: t('error.passwords.match.description'),
        });
        return;
      }

      const { error } = await supabase.auth.updateUser({ 
        password: newPassword
      });

      if (error) throw error;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('No user session');

      const { error: updateError } = await supabase
        .from('customer_checklist_progress')
        .update({ password_updated: true })
        .eq('customer_id', session.user.id);

      if (updateError) throw updateError;

      toast({
        title: t('success'),
        description: t('password.updated'),
      });
      
      onComplete();
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        variant: "destructive",
        title: t('error'),
        description: t('error.password.update'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Input
          type="password"
          placeholder={t('current.password')}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="h-12 mb-4"
          required
        />
      </div>
      <div>
        <Input
          type="password"
          placeholder={t('new.password')}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="h-12 mb-4"
          required
        />
      </div>
      <div>
        <Input
          type="password"
          placeholder={t('confirm.password')}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="h-12"
          required
        />
      </div>
      <Button type="submit" disabled={isLoading} className="w-full h-12">
        {isLoading ? t('updating.password') : t('update.password')}
      </Button>
    </form>
  );
};