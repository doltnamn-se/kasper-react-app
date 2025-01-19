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
    <div className="rounded-[4px] border border-[#e5e5e5] overflow-hidden">
      <Table>
        <TableHeader className="bg-[#e5e5e5]">
          <TableRow className="hover:bg-[#e5e5e5]">
            <TableHead className="text-xs font-normal text-black">{t('table.userId')}</TableHead>
            <TableHead className="text-xs font-normal text-black">{t('table.email')}</TableHead>
            <TableHead className="text-xs font-normal text-black">{t('table.role')}</TableHead>
            <TableHead className="text-xs font-normal text-black">{t('table.firstName')}</TableHead>
            <TableHead className="text-xs font-normal text-black">{t('table.lastName')}</TableHead>
            <TableHead className="text-xs font-normal text-black">{t('table.created')}</TableHead>
            <TableHead className="text-xs font-normal text-black">{t('table.status')}</TableHead>
            <TableHead className="text-right text-xs font-normal text-black">{t('table.actions')}</TableHead>
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