import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CustomerWithProfile } from "@/types/customer";
import { CustomerTableRow } from "./CustomerTableRow";
import { useLanguage } from "@/contexts/LanguageContext";

interface CustomersTableProps {
  customers: CustomerWithProfile[];
  onCustomerUpdated: () => void;
  onDeleteCustomer: (customerId: string) => void;
}

export const CustomersTable = ({ 
  customers, 
  onCustomerUpdated,
  onDeleteCustomer 
}: CustomersTableProps) => {
  const { t } = useLanguage();
  
  return (
    <div className="rounded-md border border-[#333333] overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-xs font-medium">{t('table.email')}</TableHead>
            <TableHead className="text-xs font-medium">{t('table.role')}</TableHead>
            <TableHead className="text-xs font-medium">{t('table.firstName')}</TableHead>
            <TableHead className="text-xs font-medium">{t('table.lastName')}</TableHead>
            <TableHead className="text-xs font-medium">{t('table.created')}</TableHead>
            <TableHead className="text-xs font-medium">{t('table.status')}</TableHead>
            <TableHead className="text-right text-xs font-medium">{t('table.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <CustomerTableRow 
              key={customer.id} 
              customer={customer} 
              onCustomerUpdated={onCustomerUpdated}
              onDeleteCustomer={onDeleteCustomer}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};