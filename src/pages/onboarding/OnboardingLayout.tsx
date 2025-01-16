import { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Customer } from "@/types/customer";

export const OnboardingLayout = () => {
  const navigate = useNavigate();
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
      // Calculate progress based on onboarding_step
      setProgress((customerData.onboarding_step / 5) * 100);
    };

    fetchCustomerData();
  }, [navigate]);

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