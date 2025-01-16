import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CreateCustomerDialog } from "@/components/admin/CreateCustomerDialog";
import { CustomersTable } from "@/components/admin/CustomersTable";
import { CustomerWithProfile } from "@/types/customer";

const AdminCustomers = () => {
  const { data: customers, isLoading, error, refetch } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      console.log('Fetching customers data...');
      
      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          profile:profiles (*)
        `);
        
      if (error) {
        console.error("Error fetching customers:", error);
        throw error;
      }
      
      console.log('Customers data received:', data);
      return data as CustomerWithProfile[];
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Customer Management</h1>
        <CreateCustomerDialog onCustomerCreated={refetch} />
      </div>
      <CustomersTable customers={customers || []} onCustomerUpdated={refetch} />
    </div>
  );
};

export default AdminCustomers;