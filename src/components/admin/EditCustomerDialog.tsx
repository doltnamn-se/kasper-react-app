import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CustomerWithProfile } from "@/types/customer";
import { EditCustomerForm } from "./EditCustomerForm";

interface EditCustomerDialogProps {
  customer: CustomerWithProfile;
  onCustomerUpdated: () => void;
}

export const EditCustomerDialog = ({ customer, onCustomerUpdated }: EditCustomerDialogProps) => {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateCustomer = async (firstName: string, lastName: string) => {
    try {
      setIsUpdating(true);
      console.log('Updating customer profile:', customer.id);

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
        })
        .eq('id', customer.id);

      if (profileError) {
        console.error("Error updating profile:", profileError);
        throw profileError;
      }

      console.log('Customer profile updated successfully');
      toast({
        title: "Success",
        description: "Customer updated successfully.",
      });

      onCustomerUpdated();
    } catch (err) {
      console.error("Error in customer update:", err);
      toast({
        title: "Error",
        description: "Failed to update customer profile. Please try again.",
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
        <EditCustomerForm 
          customer={customer}
          onSubmit={handleUpdateCustomer}
          isUpdating={isUpdating}
        />
      </DialogContent>
    </Dialog>
  );
};