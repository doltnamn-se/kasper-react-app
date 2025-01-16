import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { CustomerWithProfile } from "@/types/customer";
import { supabase } from "@/integrations/supabase/client";
import { CustomerTableRow } from "./CustomerTableRow";

interface CustomersTableProps {
  customers: CustomerWithProfile[];
  onCustomerUpdated: () => void;
}

export const CustomersTable = ({ customers, onCustomerUpdated }: CustomersTableProps) => {
  const { toast } = useToast();

  const handleDeleteCustomer = async (customerId: string) => {
    if (!confirm("Are you sure you want to delete this customer? This action cannot be undone.")) {
      return;
    }

    try {
      console.log('Deleting customer:', customerId);
      
      const { error: authError } = await supabase.auth.admin.deleteUser(customerId);

      if (authError) {
        console.error("Error deleting auth user:", authError);
        toast({
          title: "Error",
          description: "Failed to delete customer. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Customer deleted successfully.",
      });

      onCustomerUpdated();
    } catch (err) {
      console.error("Error in customer deletion:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Onboarding</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers?.map((customer) => (
            <CustomerTableRow
              key={customer.id}
              customer={customer}
              onCustomerUpdated={onCustomerUpdated}
              onDeleteCustomer={handleDeleteCustomer}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};