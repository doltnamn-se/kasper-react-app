import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

interface PersonalInfoFormProps {
  onComplete: () => void;
}

export const PersonalInfoForm = ({ onComplete }: PersonalInfoFormProps) => {
  const [address, setAddress] = useState("");
  const [personalNumber, setPersonalNumber] = useState("");
  const [hideAddress, setHideAddress] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('No user session');

      const { error } = await supabase
        .from('customer_checklist_progress')
        .update({
          address,
          personal_number: personalNumber,
          is_address_hidden: hideAddress,
          completed_at: new Date().toISOString()
        })
        .eq('customer_id', session.user.id);

      if (error) throw error;

      toast({
        title: "Information saved",
        description: "Your personal information has been successfully saved.",
      });
      
      onComplete();
    } catch (error) {
      console.error('Error saving personal information:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save personal information. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          placeholder="Enter your address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="personalNumber">Personal Number</Label>
        <Input
          id="personalNumber"
          placeholder="Enter your personal number"
          value={personalNumber}
          onChange={(e) => setPersonalNumber(e.target.value)}
          required
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="hideAddress">Hide address from public records</Label>
        <Switch
          id="hideAddress"
          checked={hideAddress}
          onCheckedChange={setHideAddress}
        />
      </div>

      <Button
        type="submit"
        disabled={isLoading || !address || !personalNumber}
        className="w-full"
      >
        {isLoading ? "Saving..." : "Complete Checklist"}
      </Button>
    </form>
  );
};