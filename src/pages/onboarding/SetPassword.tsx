import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export const SetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initializationAttempts, setInitializationAttempts] = useState(0);

  useEffect(() => {
    let mounted = true;
    const MAX_ATTEMPTS = 3;

    const initSession = async () => {
      try {
        console.log("SetPassword: Checking for magic link parameters...");
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const isMagicLink = hashParams.get('type') === 'magiclink';

        if (isMagicLink) {
          console.log("SetPassword: Magic link detected, waiting for session...");
          // Give time for the magic link session to be established
          setTimeout(async () => {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            
            if (sessionError) {
              console.error("SetPassword: Session error:", sessionError);
              if (mounted) {
                toast({
                  title: "Error",
                  description: "Unable to initialize session. Please try again.",
                  variant: "destructive",
                });
                navigate("/auth");
              }
              return;
            }

            if (!session?.user?.id) {
              console.log("SetPassword: No session found after magic link");
              if (mounted && initializationAttempts < MAX_ATTEMPTS) {
                setInitializationAttempts(prev => prev + 1);
                return;
              }
            }

            if (mounted && session?.user?.id) {
              console.log("SetPassword: Session established with user ID:", session.user.id);
              setUserId(session.user.id);
              setIsInitializing(false);
            }
          }, 2000); // Wait 2 seconds for magic link session
          return;
        }

        // Regular session check
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        if (!session?.user?.id) {
          console.log("SetPassword: No session found");
          if (mounted) {
            toast({
              title: "Error",
              description: "No active session found. Please try logging in again.",
              variant: "destructive",
            });
            navigate("/auth");
          }
          return;
        }

        if (mounted) {
          console.log("SetPassword: Session found with user ID:", session.user.id);
          setUserId(session.user.id);
          setIsInitializing(false);
        }
      } catch (error: any) {
        console.error("SetPassword: Init error:", error);
        if (mounted) {
          toast({
            title: "Error",
            description: "Unable to initialize your session. Please try again.",
            variant: "destructive",
          });
          navigate("/auth");
        }
      }
    };

    if (initializationAttempts < MAX_ATTEMPTS) {
      initSession();
    } else {
      console.log("SetPassword: Max initialization attempts reached");
      if (mounted) {
        toast({
          title: "Error",
          description: "Unable to initialize session after multiple attempts. Please try again.",
          variant: "destructive",
        });
        navigate("/auth");
      }
    }

    return () => {
      mounted = false;
    };
  }, [navigate, toast, initializationAttempts, location.hash]);

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

      {isInitializing ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="text-sm text-gray-600">
              {initializationAttempts > 0 
                ? `Initializing session (Attempt ${initializationAttempts + 1}/3)...`
                : "Initializing your session..."}
            </p>
          </div>
        </div>
      ) : (
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
      )}
    </div>
  );
};
