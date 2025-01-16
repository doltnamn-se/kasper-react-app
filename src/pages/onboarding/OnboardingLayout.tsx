import { useEffect, useState } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Customer } from "@/types/customer";

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
  const [progress, setProgress] = useState(0);
  const [customer, setCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    const fetchCustomerData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: customerData, error } = await supabase
        .from("customers")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching customer data:", error);
        return;
      }

      setCustomer(customerData);

      // Calculate progress based on current step
      const currentStepIndex = ONBOARDING_STEPS.indexOf(location.pathname);
      if (currentStepIndex !== -1) {
        setProgress(((currentStepIndex + 1) / ONBOARDING_STEPS.length) * 100);
      }

      // Skip removal URLs step for 1-month subscription
      if (location.pathname === "/onboarding/hiding-preferences" && 
          customerData.subscription_plan === "1_month") {
        ONBOARDING_STEPS.splice(2, 1);
      }
    };

    fetchCustomerData();
  }, [navigate, location.pathname]);

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