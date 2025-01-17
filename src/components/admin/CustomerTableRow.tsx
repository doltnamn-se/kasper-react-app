import { TableCell, TableRow } from "@/components/ui/table";
import { CustomerWithProfile } from "@/types/customer";
import { format } from "date-fns";
import { CustomerTableActions } from "./CustomerTableActions";
import { Badge } from "../ui/badge";

interface CustomerTableRowProps {
  customer: CustomerWithProfile;
  onCustomerUpdated: () => void;
  onDeleteCustomer: (customerId: string) => void;
}

export const CustomerTableRow = ({ 
  customer, 
  onCustomerUpdated,
  onDeleteCustomer 
}: CustomerTableRowProps) => {
  const getBadgeVariant = (role: string | null) => {
    switch (role) {
      case 'super_admin':
        return 'destructive';
      case 'customer':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <TableRow key={customer.id}>
      <TableCell>{customer.profile?.id}</TableCell>
      <TableCell>
        <Badge variant={getBadgeVariant(customer.profile?.role)}>
          {customer.profile?.role || 'No role'}
        </Badge>
      </TableCell>
      <TableCell>{customer.profile?.first_name || '-'}</TableCell>
      <TableCell>{customer.profile?.last_name || '-'}</TableCell>
      <TableCell>
        {customer.created_at
          ? format(new Date(customer.created_at), 'MMM d, yyyy')
          : '-'}
      </TableCell>
      <TableCell>
        <Badge variant={customer.onboarding_completed ? "default" : "secondary"}>
          {customer.onboarding_completed ? 'Complete' : 'Incomplete'}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <CustomerTableActions 
          customer={customer} 
          onCustomerUpdated={onCustomerUpdated}
          onDeleteCustomer={onDeleteCustomer}
        />
      </TableCell>
    </TableRow>
  );
};