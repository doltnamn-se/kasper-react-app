import { useState } from "react";
import { CustomerWithProfile } from "@/types/customer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EditCustomerFormProps {
  customer: CustomerWithProfile;
  onSubmit: (displayName: string) => Promise<void>;
  isUpdating: boolean;
}

export const EditCustomerForm = ({
  customer,
  onSubmit,
  isUpdating
}: EditCustomerFormProps) => {
  const [displayName, setDisplayName] = useState(customer.profile?.display_name || "");

  const handleSubmit = () => {
    if (!displayName.trim()) {
      return; // Don't submit if display name is empty
    }
    onSubmit(displayName.trim());
  };

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="displayName">Display Name</Label>
        <Input
          id="displayName"
          placeholder="Enter display name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
      </div>
      <Button 
        className="w-full" 
        onClick={handleSubmit}
        disabled={isUpdating || !displayName.trim()}
      >
        {isUpdating ? "Updating..." : "Update Customer"}
      </Button>
    </div>
  );
};