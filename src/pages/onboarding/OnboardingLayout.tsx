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

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        console.log("OnboardingLayout: Fetching customer data...");
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.log("OnboardingLayout: No authenticated user found");
          navigate("/auth");
          return;
        }

        console.log("OnboardingLayout: Fetching data for user:", user.id);
        const { data: customerData, error } = await supabase
          .from("customers")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (error) {
          console.error("OnboardingLayout: Error fetching customer data:", error);
          toast({
            title: "Error",
            description: "Failed to load customer data. Please try again.",
            variant: "destructive",
          });
          return;
        }

        if (!customerData) {
          console.log("OnboardingLayout: No customer record found");
          toast({
            title: "Error",
            description: "Customer profile not found. Please contact support.",
            variant: "destructive",
          });
          navigate("/auth");
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
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomerData();
  }, [navigate, location.pathname, toast]);

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