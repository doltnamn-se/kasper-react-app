import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CustomerWithProfile } from "@/types/customer";
import { CustomerTableActions } from "./CustomerTableActions";
import { CustomerTableRow } from "./CustomerTableRow";

interface CustomersTableProps {
  customers: CustomerWithProfile[];
  onCustomerUpdated: () => void;
}

export const CustomersTable = ({ customers, onCustomerUpdated }: CustomersTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>First Name</TableHead>
            <TableHead>Last Name</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <CustomerTableRow 
              key={customer.id} 
              customer={customer} 
              onCustomerUpdated={onCustomerUpdated}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};