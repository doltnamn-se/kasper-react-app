import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { CustomerFormFields } from "./CustomerFormFields";
import { useCustomerCreation } from "@/hooks/useCustomerCreation";
import { useState } from "react";

interface CreateCustomerDialogProps {
  onCustomerCreated: () => void;
}

export const CreateCustomerDialog = ({ onCustomerCreated }: CreateCustomerDialogProps) => {
  const [open, setOpen] = useState(false);
  const { formData, setFormData, isCreating, handleCreateCustomer } = useCustomerCreation(async () => {
    onCustomerCreated();
    setOpen(false);
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="w-4 h-4 mr-2" />
          Add Customer
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Customer</DialogTitle>
          <DialogDescription>
            Add a new customer to the platform. Fill in their details below.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <CustomerFormFields
            email={formData.email}
            displayName={formData.displayName}
            subscriptionPlan={formData.subscriptionPlan}
            customerType={formData.customerType}
            hasAddressAlert={formData.hasAddressAlert}
            onEmailChange={(email) => setFormData(prev => ({ ...prev, email }))}
            onDisplayNameChange={(displayName) => setFormData(prev => ({ ...prev, displayName }))}
            onSubscriptionPlanChange={(subscriptionPlan) => setFormData(prev => ({ ...prev, subscriptionPlan }))}
            onCustomerTypeChange={(customerType) => setFormData(prev => ({ ...prev, customerType }))}
            onHasAddressAlertChange={(hasAddressAlert) => setFormData(prev => ({ ...prev, hasAddressAlert }))}
          />
          <Button 
            className="w-full" 
            onClick={handleCreateCustomer}
            disabled={isCreating || !formData.email || !formData.displayName}
          >
            {isCreating ? "Creating..." : "Create Customer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};