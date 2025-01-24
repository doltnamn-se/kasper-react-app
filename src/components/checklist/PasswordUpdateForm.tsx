import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Check } from "lucide-react";

interface PasswordUpdateFormProps {
  onComplete: () => void;
}

interface PasswordRequirement {
  text: string;
  validator: (password: string) => boolean;
}

export const PasswordUpdateForm = ({ onComplete }: PasswordUpdateFormProps) => {
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const passwordRequirements: PasswordRequirement[] = [
    {
      text: t('password.requirement.length'),
      validator: (password) => password.length >= 12,
    },
    {
      text: t('password.requirement.lowercase'),
      validator: (password) => /[a-z]/.test(password),
    },
    {
      text: t('password.requirement.uppercase'),
      validator: (password) => /[A-Z]/.test(password),
    },
    {
      text: t('password.requirement.special'),
      validator: (password) => /[\d\W\s]/.test(password),
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const allRequirementsMet = passwordRequirements.every(req => 
        req.validator(newPassword)
      );

      if (!allRequirementsMet) {
        toast({
          variant: "destructive",
          title: t('error'),
          description: t('error.password.requirements'),
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
      <div className="w-full md:w-1/2">
        <Input
          type="password"
          placeholder={t('new.password')}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="h-12"
          required
        />
        <div className="mt-4 space-y-2">
          {passwordRequirements.map((requirement, index) => (
            <div 
              key={index}
              className="flex items-center gap-2 text-sm"
            >
              <div className={`flex items-center justify-center w-5 h-5 rounded-full transition-colors ${
                requirement.validator(newPassword) 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}>
                <Check className="w-3 h-3" />
              </div>
              <span className={requirement.validator(newPassword) ? 'text-green-500' : 'text-gray-500'}>
                {requirement.text}
              </span>
            </div>
          ))}
        </div>
      </div>
      <Button type="submit" disabled={isLoading} className="w-full md:w-1/4 h-12">
        {isLoading ? t('updating.password') : t('update.password')}
      </Button>
    </form>
  );
};