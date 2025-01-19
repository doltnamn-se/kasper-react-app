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
  const { t, language } = useLanguage();
  
  return (
    <div className="rounded-[4px] border border-[#e5e5e5] dark:border-[#303032] overflow-hidden">
      <Table>
        <TableHeader className="bg-[#e5e5e5] dark:bg-[#303032]">
          <TableRow className="hover:bg-[#e5e5e5] dark:hover:bg-[#303032]">
            <TableHead className="text-xs font-normal text-black dark:text-white">{t('table.userId')}</TableHead>
            <TableHead className="text-xs font-normal text-black dark:text-white">{t('table.email')}</TableHead>
            <TableHead className="text-xs font-normal text-black dark:text-white">{t('table.role')}</TableHead>
            <TableHead className="text-xs font-normal text-black dark:text-white" colSpan={2}>{language === 'sv' ? 'Namn' : 'Name'}</TableHead>
            <TableHead className="text-xs font-normal text-black dark:text-white">{t('table.created')}</TableHead>
            <TableHead className="text-xs font-normal text-black dark:text-white">{t('table.subscription')}</TableHead>
            <TableHead className="text-right text-xs font-normal text-black dark:text-white">{t('table.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <CustomerTableRow 
              key={customer.profile.id} 
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