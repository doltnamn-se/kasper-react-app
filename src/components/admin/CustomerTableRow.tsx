import { TableCell, TableRow } from "@/components/ui/table";
import { CustomerWithProfile } from "@/types/customer";
import { format } from "date-fns";
import { CustomerTableActions } from "./CustomerTableActions";
import { Badge } from "../ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { language } = useLanguage();
  
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
    if (!plan) return '';
    
    switch (plan) {
      case '1_month':
        return language === 'sv' ? '1 MÅN' : '1 MO';
      case '6_months':
        return language === 'sv' ? '6 MÅN' : '6 MO';
      case '12_months':
        return language === 'sv' ? '12 MÅN' : '12 MO';
      default:
        return '';
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
        {customer.subscription_plan && (
          <Badge 
            variant="secondary"
            className="text-xs font-normal text-subscription-text bg-subscription-bg dark:text-subscription-text dark:bg-subscription-bg"
          >
            {formatSubscriptionPlan(customer.subscription_plan)}
          </Badge>
        )}
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