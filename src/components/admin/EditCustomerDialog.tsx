import { useState } from "react";
import { CustomerWithProfile } from "@/types/customer";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EditCustomerForm } from "./EditCustomerForm";
import { supabase } from "@/integrations/supabase/client";
import { Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EditCustomerDialogProps {
  customer: CustomerWithProfile;
  onCustomerUpdated: () => void;
}

export const EditCustomerDialog = ({ customer, onCustomerUpdated }: EditCustomerDialogProps) => {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateCustomer = async (displayName: string) => {
    try {
      setIsUpdating(true);
      console.log('Updating customer profile:', customer.id);
      console.log('New display name:', displayName);

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          display_name: displayName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', customer.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update customer profile",
        });
        return;
      }

      console.log('Profile updated successfully');
      toast({
        title: "Success",
        description: "Customer profile updated successfully",
      });
      
      onCustomerUpdated();
    } catch (error) {
      console.error('Error in handleUpdateCustomer:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
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