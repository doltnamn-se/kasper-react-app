import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export const SetPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("SetPassword: Session error:", error);
        toast({
          title: "Error",
          description: "Unable to verify your session. Please try again.",
          variant: "destructive",
        });
        return;
      }
      console.log("SetPassword: Session checked:", currentSession ? "Found" : "Not found");
      setSession(currentSession);
    };

    checkSession();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      console.error("SetPassword: No active session found");
      toast({
        title: "Error",
        description: "No active session found. Please try logging in again.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log("SetPassword: Updating password");
      const { error: updateError } = await supabase.auth.updateUser({ password });
      
      if (updateError) {
        console.error("SetPassword: Password update error:", updateError);
        throw updateError;
      }

      console.log("SetPassword: Password updated successfully");

      // Update onboarding step
      const { error: updateStepError } = await supabase
        .from("customers")
        .update({ onboarding_step: 2 })
        .eq("id", session.user.id);

      if (updateStepError) {
        console.error("SetPassword: Error updating onboarding step:", updateStepError);
        throw updateStepError;
      }

      console.log("SetPassword: Onboarding step updated");

      toast({
        title: "Success",
        description: "Password set successfully",
      });

      navigate("/onboarding/hiding-preferences");
    } catch (error: any) {
      console.error("SetPassword: Error:", error);
      toast({
        title: "Error",
        description: error.message || "An error occurred while setting your password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Set Your Password</h1>
        <p className="text-muted-foreground">
          Choose a secure password for your account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        <div className="space-y-2">
          <Input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Setting password..." : "Continue"}
        </Button>
      </form>
    </div>
  );
};