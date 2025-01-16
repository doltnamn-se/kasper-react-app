import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

const HIDING_SITES = [
  { id: "eniro", label: "Eniro" },
  { id: "hitta", label: "Hitta" },
  { id: "birthday", label: "Birthday" },
  { id: "ratsit", label: "Ratsit" },
  { id: "merinfo", label: "Merinfo" },
] as const;

export const HidingPreferences = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Get customer subscription plan
      const { data: customerData } = await supabase
        .from("customers")
        .select("subscription_plan")
        .eq("id", user.id)
        .single();

      // Insert hiding preferences
      const { error: preferencesError } = await supabase.from("hiding_preferences")
        .insert(
          selectedSites.map(site => ({
            customer_id: user.id,
            site_name: site,
            site_type: site,
          }))
        );

      if (preferencesError) throw preferencesError;

      // Update onboarding step
      const { error: updateError } = await supabase
        .from("customers")
        .update({ onboarding_step: 3 })
        .eq("id", user.id);

      if (updateError) throw updateError;

      // Navigate based on subscription plan
      if (customerData?.subscription_plan === "1_month") {
        navigate("/onboarding/identification");
      } else {
        navigate("/onboarding/removal-urls");
      }

      toast({
        title: "Success",
        description: "Hiding preferences saved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Choose Hiding Preferences</h1>
        <p className="text-muted-foreground">
          Select the sites you want to hide your information from
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {HIDING_SITES.map((site) => (
            <div key={site.id} className="flex items-center space-x-2">
              <Checkbox
                id={site.id}
                checked={selectedSites.includes(site.id)}
                onCheckedChange={(checked) => {
                  setSelectedSites(prev =>
                    checked
                      ? [...prev, site.id]
                      : prev.filter(s => s !== site.id)
                  );
                }}
              />
              <Label htmlFor={site.id}>{site.label}</Label>
            </div>
          ))}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading || selectedSites.length === 0}>
          {isLoading ? "Saving..." : "Continue"}
        </Button>
      </form>
    </div>
  );
};