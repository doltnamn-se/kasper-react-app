import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export const IdentificationInfo = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [identificationInfo, setIdentificationInfo] = useState({
    personalNumber: "",
    address: "",
    phoneNumber: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Update customer with identification info
      const { error: updateError } = await supabase
        .from("customers")
        .update({
          identification_info: identificationInfo,
          onboarding_step: 5,
          onboarding_completed: true,
        })
        .eq("id", user.id);

      if (updateError) throw updateError;

      navigate("/onboarding/complete");

      toast({
        title: "Success",
        description: "Identification information saved successfully",
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
        <h1 className="text-2xl font-bold">Identification Information</h1>
        <p className="text-muted-foreground">
          Please provide your identification details
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="personalNumber">Personal Number</Label>
            <Input
              id="personalNumber"
              placeholder="YYYYMMDD-XXXX"
              value={identificationInfo.personalNumber}
              onChange={(e) =>
                setIdentificationInfo({
                  ...identificationInfo,
                  personalNumber: e.target.value,
                })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              placeholder="Enter your address"
              value={identificationInfo.address}
              onChange={(e) =>
                setIdentificationInfo({
                  ...identificationInfo,
                  address: e.target.value,
                })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              placeholder="Enter your phone number"
              value={identificationInfo.phoneNumber}
              onChange={(e) =>
                setIdentificationInfo({
                  ...identificationInfo,
                  phoneNumber: e.target.value,
                })
              }
              required
            />
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Saving..." : "Complete Onboarding"}
        </Button>
      </form>
    </div>
  );
};