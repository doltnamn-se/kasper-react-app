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

interface CustomersTableProps {
  customers: CustomerWithProfile[];
}

export const CustomersTable = ({ customers }: CustomersTableProps) => {
  const { toast } = useToast();

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
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toast({
                      title: "Coming soon",
                      description: "Customer details view will be implemented soon.",
                    });
                  }}
                >
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};