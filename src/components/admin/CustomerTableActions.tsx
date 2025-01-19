import { Button } from "@/components/ui/button";
import { CustomerWithProfile } from "@/types/customer";
import { CustomerDetails } from "./CustomerDetails";
import { EditCustomerDialog } from "./EditCustomerDialog";
import { Trash2 } from "lucide-react";

interface CustomerTableActionsProps {
  customer: CustomerWithProfile;
  onCustomerUpdated: () => void;
  onDeleteCustomer: (customerId: string) => void;
}

export const CustomerTableActions = ({
  customer,
  onCustomerUpdated,
  onDeleteCustomer,
}: CustomerTableActionsProps) => {
  return (
    <div className="flex items-center justify-end space-x-2">
      <CustomerDetails customer={customer} />
      <EditCustomerDialog 
        customer={customer} 
        onCustomerUpdated={onCustomerUpdated} 
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() => onDeleteCustomer(customer.id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};