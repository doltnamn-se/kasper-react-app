import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomerWithProfile } from "@/types/customer";

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

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="displayName">Display Name</Label>
        <Input
          id="displayName"
          placeholder="John Doe"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
      </div>
      <Button 
        className="w-full" 
        onClick={() => onSubmit(displayName)}
        disabled={isUpdating}
      >
        {isUpdating ? "Updating..." : "Update Customer"}
      </Button>
    </div>
  );
};