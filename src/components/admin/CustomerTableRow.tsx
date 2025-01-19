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

  const formatSubscriptionPlan = (plan: string | null) => {
    switch (plan) {
      case '1_month':
        return '1 Month';
      case '6_months':
        return '6 Months';
      case '12_months':
        return '12 Months';
      default:
        return 'No plan';
    }
  };

  console.log("Rendering customer row:", customer);

  return (
    <TableRow className="text-xs bg-white hover:bg-white">
      <TableCell className="text-xs text-black">{customer.profile.id || '-'}</TableCell>
      <TableCell className="text-xs text-black">{customer.profile.email || '-'}</TableCell>
      <TableCell>
        <Badge 
          variant={getBadgeVariant(customer.profile.role)}
          className="text-xs font-normal"
        >
          {customer.profile.role || 'No role'}
        </Badge>
      </TableCell>
      <TableCell className="text-xs text-black">{customer.profile.first_name || '-'}</TableCell>
      <TableCell className="text-xs text-black">{customer.profile.last_name || '-'}</TableCell>
      <TableCell className="text-xs text-black">
        {customer.profile.created_at
          ? format(new Date(customer.profile.created_at), 'MMM d, yyyy')
          : '-'}
      </TableCell>
      <TableCell>
        <Badge 
          variant="secondary"
          className="text-xs font-normal"
        >
          {formatSubscriptionPlan(customer.subscription_plan)}
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