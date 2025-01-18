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
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const initSession = async () => {
      try {
        // First check for magic link parameters
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const isMagicLink = hashParams.get('type') === 'magiclink';
        
        if (isMagicLink) {
          console.log("SetPassword: Magic link detected, proceeding with session setup");
          // Let the magic link process complete before checking session
          return;
        }

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("SetPassword: Session error:", sessionError);
          throw sessionError;
        }

        if (!session?.user?.id) {
          console.error("SetPassword: No user ID in session");
          throw new Error("No active session found");
        }

        console.log("SetPassword: Session initialized with user ID:", session.user.id);
        setUserId(session.user.id);
      } catch (error: any) {
        console.error("SetPassword: Init error:", error);
        toast({
          title: "Error",
          description: "Unable to verify your session. Please try logging in again.",
          variant: "destructive",
        });
        navigate("/auth");
      }
    };

    initSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("SetPassword: Auth state changed:", event);
      
      if (event === 'SIGNED_IN' && session?.user?.id) {
        console.log("SetPassword: User signed in with ID:", session.user.id);
        setUserId(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        console.log("SetPassword: User signed out");
        navigate("/auth");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      console.error("SetPassword: No user ID available");
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
      console.log("SetPassword: Updating password for user:", userId);
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
        .eq("id", userId);

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