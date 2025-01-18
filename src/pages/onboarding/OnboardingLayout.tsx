import { useEffect, useState } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Customer } from "@/types/customer";
import { useToast } from "@/hooks/use-toast";

const ONBOARDING_STEPS = [
  "/onboarding/set-password",
  "/onboarding/hiding-preferences",
  "/onboarding/removal-urls",
  "/onboarding/identification",
  "/onboarding/complete",
];

export const OnboardingLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [progress, setProgress] = useState(0);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      try {
        console.log("OnboardingLayout: Checking auth state...");
        
        // Check for magic link parameters in URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const isMagicLink = hashParams.get('type') === 'magiclink';
        
        if (isMagicLink) {
          console.log("OnboardingLayout: Magic link detected, proceeding with onboarding");
          // Let the magic link process complete
          return;
        }

        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("OnboardingLayout: Session error:", sessionError);
          navigate("/auth");
          return;
        }

        if (!session) {
          console.log("OnboardingLayout: No session found, redirecting to auth");
          navigate("/auth");
          return;
        }

        console.log("OnboardingLayout: Session found, checking customer data");
        
        // Check if customer exists and fetch their data
        const { data: customerData, error: customerError } = await supabase
          .from("customers")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();

        if (customerError) {
          console.error("OnboardingLayout: Error fetching customer:", customerError);
          if (retryCount < 3) {
            setRetryCount(prev => prev + 1);
            return;
          }
          throw customerError;
        }

        if (!customerData) {
          console.log("OnboardingLayout: No customer record found");
          toast({
            title: "Error",
            description: "Unable to load your profile. Please try refreshing the page.",
            variant: "destructive",
          });
          navigate("/auth");
          return;
        }

        // If onboarding is completed, redirect to home
        if (customerData.onboarding_completed) {
          console.log("OnboardingLayout: Onboarding already completed, redirecting to home");
          navigate("/");
          return;
        }

        console.log("OnboardingLayout: Customer data fetched:", customerData);
        setCustomer(customerData);

        // Calculate progress based on current step
        const currentStepIndex = ONBOARDING_STEPS.indexOf(location.pathname);
        if (currentStepIndex !== -1) {
          const progressValue = ((currentStepIndex + 1) / ONBOARDING_STEPS.length) * 100;
          console.log("OnboardingLayout: Setting progress to:", progressValue);
          setProgress(progressValue);
        }

        // Skip removal URLs step for 1-month subscription
        if (location.pathname === "/onboarding/hiding-preferences" && 
            customerData.subscription_plan === "1_month") {
          console.log("OnboardingLayout: Skipping removal URLs step for 1-month plan");
          ONBOARDING_STEPS.splice(2, 1);
        }
      } catch (error) {
        console.error("OnboardingLayout: Unexpected error:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try refreshing the page.",
          variant: "destructive",
        });
        navigate("/auth");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndFetchData();
  }, [navigate, location.pathname, toast, retryCount]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl mx-auto py-8 px-4">
        <div className="mb-8">
          <Progress value={progress} className="w-full" />
        </div>
        <Outlet context={{ customer }} />
      </div>
    </div>
  );
};