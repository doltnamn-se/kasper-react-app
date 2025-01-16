import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CustomerWithProfile } from "@/types/customer";

interface EditCustomerDialogProps {
  customer: CustomerWithProfile;
  onCustomerUpdated: () => void;
}

export const EditCustomerDialog = ({ customer, onCustomerUpdated }: EditCustomerDialogProps) => {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [firstName, setFirstName] = useState(customer.profile?.first_name || "");
  const [lastName, setLastName] = useState(customer.profile?.last_name || "");

  const handleUpdateCustomer = async () => {
    try {
      setIsUpdating(true);
      console.log('Updating customer profile...');

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
        })
        .eq('id', customer.id);

      if (profileError) {
        console.error("Error updating profile:", profileError);
        toast({
          title: "Error",
          description: "Failed to update customer profile. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Customer updated successfully.",
      });

      onCustomerUpdated();
    } catch (err) {
      console.error("Error in customer update:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Customer</DialogTitle>
        </DialogHeader>
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
            onClick={handleUpdateCustomer}
            disabled={isUpdating}
          >
            {isUpdating ? "Updating..." : "Update Customer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};