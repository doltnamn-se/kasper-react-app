import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LoginFormProps {
  onForgotPassword: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const LoginForm = ({ onForgotPassword, isLoading, setIsLoading }: LoginFormProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Attempting sign in with email:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Sign in error:", error);
        if (error.message === 'Invalid login credentials') {
          toast.error(t('error.invalid.credentials'));
        } else {
          toast.error(t('error.signin'));
        }
        return;
      }

      if (data?.session) {
        console.log("Sign in successful, session established");
        await supabase.auth.setSession(data.session);
        
        // Check if user is admin
        if (email === 'info@doltnamn.se') {
          console.log("Admin user detected, redirecting to admin dashboard");
          window.location.href = '/admin';
          return;
        }

        // Check checklist completion status
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('checklist_completed')
          .eq('id', data.session.user.id)
          .single();

        if (customerError) {
          console.error("Error fetching customer data:", customerError);
          toast.error(t('error.generic'));
          return;
        }

        console.log("Customer checklist status:", customerData?.checklist_completed);
        
        // Redirect based on checklist completion
        if (!customerData?.checklist_completed) {
          console.log("Checklist not completed, redirecting to checklist");
          window.location.href = '/checklist';
        } else {
          console.log("Checklist completed, redirecting to home");
          window.location.href = '/';
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full h-12 bg-transparent border-0 border-b border-[#e0e0e0] dark:border-[#3a3a3b] rounded-none text-black dark:text-white placeholder:text-[#000000A6] dark:placeholder:text-[#FFFFFFA6] font-medium pl-0 placeholder:font-medium font-system-ui"
          placeholder={t('email.placeholder')}
          disabled={isLoading}
          required
        />
      </div>
      <div className="relative">
        <Input
          id="password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full h-12 bg-transparent border-0 border-b border-[#e0e0e0] dark:border-[#3a3a3b] rounded-none text-black dark:text-white placeholder:text-[#000000A6] dark:placeholder:text-[#FFFFFFA6] font-medium pl-0 pr-10 placeholder:font-medium font-system-ui"
          placeholder={t('password.placeholder')}
          disabled={isLoading}
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-[#000000A6] dark:text-[#FFFFFFA6] hover:text-[#000000] dark:hover:text-[#FFFFFF] focus:outline-none"
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      </div>
      <div className="space-y-2">
        <Button
          type="submit"
          className="w-full h-12 bg-black hover:bg-[#333333] text-white dark:bg-white dark:text-black dark:hover:bg-[#cfcfcf] rounded-[4px] font-system-ui"
          disabled={isLoading}
        >
          {isLoading ? t('loading') : t('sign.in.button')}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onForgotPassword}
          className="w-full text-xs text-[#000000A6] hover:text-[#000000] dark:text-[#FFFFFFA6] dark:hover:text-[#FFFFFF] hover:bg-transparent font-medium"
        >
          {t('forgot.password')}
        </Button>
      </div>
    </form>
  );
};