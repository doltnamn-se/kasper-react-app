import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CustomerWithProfile } from "@/types/customer";
import { EditCustomerDialog } from "./EditCustomerDialog";
import { supabase } from "@/integrations/supabase/client";
import { Trash2 } from "lucide-react";

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
            <TableRow key={customer.id}>
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
              <TableCell className="space-x-2">
                <EditCustomerDialog 
                  customer={customer} 
                  onCustomerUpdated={onCustomerUpdated} 
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteCustomer(customer.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};