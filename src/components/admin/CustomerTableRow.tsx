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
    <TableRow className="text-xs bg-white hover:bg-white">
      <TableCell className="text-xs text-black">{customer.id || '-'}</TableCell>
      <TableCell className="text-xs text-black">{customer.profile?.email || '-'}</TableCell>
      <TableCell>
        <Badge 
          variant={getBadgeVariant(customer.profile?.role)}
          className="text-xs font-normal"
        >
          {customer.profile?.role || 'No role'}
        </Badge>
      </TableCell>
      <TableCell className="text-xs text-black">{customer.profile?.first_name || '-'}</TableCell>
      <TableCell className="text-xs text-black">{customer.profile?.last_name || '-'}</TableCell>
      <TableCell className="text-xs text-black">
        {customer.created_at
          ? format(new Date(customer.created_at), 'MMM d, yyyy')
          : '-'}
      </TableCell>
      <TableCell>
        <Badge 
          variant={customer.onboarding_completed ? "default" : "secondary"}
          className="text-xs font-normal"
        >
          {customer.onboarding_completed === true ? 'Complete' : 'Incomplete'}
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