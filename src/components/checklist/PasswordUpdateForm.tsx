import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Check, Eye, EyeOff } from "lucide-react";

interface PasswordUpdateFormProps {
  onComplete: () => void;
}

export const PasswordUpdateForm = ({ onComplete }: PasswordUpdateFormProps) => {
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t, language } = useLanguage();

  const requirements = [
    {
      id: 1,
      label: language === 'en' ? "At least 12 characters" : "Minst 12 tecken",
      validate: (pass: string) => pass.length >= 12,
    },
    {
      id: 2,
      label: language === 'en' ? "A lowercase character" : "Ett gemener-tecken",
      validate: (pass: string) => /[a-z]/.test(pass),
    },
    {
      id: 3,
      label: language === 'en' ? "A capital letter" : "Ett versaltecken",
      validate: (pass: string) => /[A-Z]/.test(pass),
    },
    {
      id: 4,
      label: language === 'en' ? "A number or a symbol" : "Ett nummer eller en symbol",
      validate: (pass: string) => /[0-9!@#$%^&*(),.?":{}|<>]/.test(pass),
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Check if all requirements are met
      const allRequirementsMet = requirements.every(req => req.validate(newPassword));
      
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
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="w-full md:w-1/2">
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder={t('new.password')}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="h-12 border-0 border-b rounded-none font-medium text-[#000000A6] placeholder:text-[#000000A6] placeholder:font-medium text-2xl pl-0 pr-10 bg-transparent"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[#000000A6] hover:text-[#000000] focus:outline-none"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {requirements.map((req) => {
          const isValid = req.validate(newPassword);
          return (
            <div
              key={req.id}
              className="flex items-center gap-2"
            >
              <div className={`flex items-center justify-center w-4 h-4 rounded-full border-2 ${
                isValid 
                  ? "border-[#00bda5] bg-[#00bda5]" 
                  : "border-[#e0e0e0] bg-white"
              }`}>
                {isValid && (
                  <Check className="h-3 w-3 text-white stroke-[4]" />
                )}
              </div>
              <span className="text-sm font-medium text-[#000000A6]">
                {req.label}
              </span>
            </div>
          );
        })}
      </div>

      <Button type="submit" disabled={isLoading} className="w-full md:w-1/4 h-12">
        {isLoading ? t('updating.password') : t('update.password')}
      </Button>
    </form>
  );
};