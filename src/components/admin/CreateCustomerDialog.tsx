
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserRoundPlus } from "lucide-react";
import { CustomerFormFields } from "./CustomerFormFields";
import { useCustomerCreation } from "@/hooks/useCustomerCreation";
import { useState } from "react";
import { ReactNode } from "react";

interface CreateCustomerDialogProps {
  onCustomerCreated: () => void;
  children: ReactNode;
}

export const CreateCustomerDialog = ({ onCustomerCreated, children }: CreateCustomerDialogProps) => {
  const [open, setOpen] = useState(false);
  const { formData, setFormData, isCreating, handleCreateCustomer } = useCustomerCreation(async () => {
    onCustomerCreated();
    setOpen(false);
  });

  const isFormValid = formData.email && formData.displayName;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
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
          <div className="flex flex-col gap-2">
            <Button 
              className="w-full" 
              onClick={() => handleCreateCustomer(true)}
              disabled={isCreating || !isFormValid}
            >
              {isCreating ? "Creating..." : "Create & Send Welcome Email"}
            </Button>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => handleCreateCustomer(false)}
              disabled={isCreating || !isFormValid}
            >
              {isCreating ? "Creating..." : "Create Without Email"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
