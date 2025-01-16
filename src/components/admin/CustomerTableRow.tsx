import { TableCell, TableRow } from "@/components/ui/table";
import { CustomerWithProfile } from "@/types/customer";
import { CustomerTableActions } from "./CustomerTableActions";

interface CustomerTableRowProps {
  customer: CustomerWithProfile;
  onCustomerUpdated: () => void;
  onDeleteCustomer: (customerId: string) => void;
}

export const CustomerTableRow = ({
  customer,
  onCustomerUpdated,
  onDeleteCustomer,
}: CustomerTableRowProps) => {
  return (
    <TableRow>
      <TableCell>
        {`${customer.profile?.first_name || ''} ${customer.profile?.last_name || ''}`.trim() || 'No name provided'}
      </TableCell>
      <TableCell>
        {customer.created_at ? new Date(customer.created_at).toLocaleDateString() : 'N/A'}
      </TableCell>
      <TableCell>
        {customer.onboarding_completed ? 
          'Completed' : 
          `Step ${customer.onboarding_step || 1}`}
      </TableCell>
      <TableCell>
        <CustomerTableActions
          customer={customer}
          onCustomerUpdated={onCustomerUpdated}
          onDeleteCustomer={onDeleteCustomer}
        />
      </TableCell>
    </TableRow>
  );
};