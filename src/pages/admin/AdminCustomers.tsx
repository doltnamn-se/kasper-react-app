import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Database } from "@/integrations/supabase/types";

type Profile = Database['public']['Tables']['profiles']['Row'];

// Simplified customer type with only the fields we need
type CustomerBasicInfo = {
  id: string;
  created_at: string | null;
  onboarding_completed: boolean | null;
  onboarding_step: number | null;
  profile?: Profile | null;
};

const AdminCustomers = () => {
  const { toast } = useToast();
  
  const { data: customers, isLoading, error } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      console.log('Fetching customers data...');
      
      // First get customers
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select(`
          id,
          created_at,
          onboarding_completed,
          onboarding_step
        `);
        
      if (customersError) {
        console.error("Error fetching customers:", customersError);
        throw customersError;
      }

      // Then get profiles for these customers
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', customersData.map(c => c.id));

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw profilesError;
      }

      // Combine the data
      const combinedData: CustomerBasicInfo[] = customersData.map(customer => ({
        ...customer,
        profile: profilesData.find(p => p.id === customer.id) || null
      }));
      
      console.log('Combined customer data:', combinedData);
      return combinedData;
    },
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
        <div className="mt-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-red-500">Error loading customers. Please try again later.</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Customer Management</h1>
      
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
                  {customer.profile ? 
                    `${customer.profile.first_name || ''} ${customer.profile.last_name || ''}`.trim() || 'No name provided' : 
                    'No name provided'}
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
    </div>
  );
};

export default AdminCustomers;