import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { CustomerFormFields } from "./CustomerFormFields";
import { useCustomerCreation } from "./useCustomerCreation";

interface CreateCustomerDialogProps {
  onCustomerCreated: () => void;
}

export const CreateCustomerDialog = ({ onCustomerCreated }: CreateCustomerDialogProps) => {
  const { formData, setFormData, isCreating, handleCreateCustomer } = useCustomerCreation(onCustomerCreated);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="w-4 h-4 mr-2" />
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
            firstName={formData.firstName}
            lastName={formData.lastName}
            subscriptionPlan={formData.subscriptionPlan}
            onEmailChange={(email) => setFormData(prev => ({ ...prev, email }))}
            onFirstNameChange={(firstName) => setFormData(prev => ({ ...prev, firstName }))}
            onLastNameChange={(lastName) => setFormData(prev => ({ ...prev, lastName }))}
            onSubscriptionPlanChange={(subscriptionPlan) => setFormData(prev => ({ ...prev, subscriptionPlan }))}
          />
          <Button 
            className="w-full" 
            onClick={handleCreateCustomer}
            disabled={isCreating || !formData.email}
          >
            {isCreating ? "Creating..." : "Create Customer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};