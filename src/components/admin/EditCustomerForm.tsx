import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomerWithProfile } from "@/types/customer";

interface EditCustomerFormProps {
  customer: CustomerWithProfile;
  onSubmit: (firstName: string, lastName: string) => Promise<void>;
  isUpdating: boolean;
}

export const EditCustomerForm = ({ 
  customer, 
  onSubmit,
  isUpdating 
}: EditCustomerFormProps) => {
  const [firstName, setFirstName] = useState(customer.profile?.first_name || "");
  const [lastName, setLastName] = useState(customer.profile?.last_name || "");

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="firstName">First Name</Label>
        <Input
          id="firstName"
          placeholder="John"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="lastName">Last Name</Label>
        <Input
          id="lastName"
          placeholder="Doe"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
      </div>
      <Button 
        className="w-full" 
        onClick={() => onSubmit(firstName, lastName)}
        disabled={isUpdating}
      >
        {isUpdating ? "Updating..." : "Update Customer"}
      </Button>
    </div>
  );
};