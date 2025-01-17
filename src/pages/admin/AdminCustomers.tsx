import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { CustomerWithProfile } from "@/types/customer";
import { CustomersTable } from "@/components/admin/CustomersTable";
import { useQuery } from "@tanstack/react-query";
import { CreateCustomerDialog } from "@/components/admin/CreateCustomerDialog";
import { TopNav } from "@/components/TopNav";

const AdminCustomers = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: customers, refetch } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      console.log("Fetching customers...");
      const { data: customersData, error: customersError } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          role,
          created_at,
          updated_at,
          customers (
            *
          )
        `);

      if (customersError) {
        console.error("Error fetching customers:", customersError);
        throw customersError;
      }

      // Transform the data to match CustomerWithProfile type
      const transformedData = customersData?.map(profile => ({
        ...profile.customers?.[0],
        profile: {
          id: profile.id,
          first_name: profile.first_name,
          last_name: profile.last_name,
          role: profile.role,
          created_at: profile.created_at,
          updated_at: profile.updated_at
        }
      })) || [];

      console.log("Customers fetched:", transformedData);
      return transformedData as CustomerWithProfile[];
    }
  });

  const handleDeleteCustomer = async (customerId: string) => {
    try {
      console.log("Deleting customer:", customerId);
      const { error: deleteError } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId);

      if (deleteError) {
        console.error("Error deleting customer:", deleteError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete customer. Please try again.",
        });
        return;
      }

      console.log("Customer deleted successfully");
      toast({
        title: "Success",
        description: "Customer deleted successfully",
      });
      refetch();
    } catch (err) {
      console.error("Unexpected error deleting customer:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
    }
  };

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        console.log("Checking admin access for user:", user);

        if (user) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error("Error fetching user role:", error);
            setError("Could not verify admin access");
            toast({
              variant: "destructive",
              title: "Error",
              description: "Could not verify admin access. Please try again.",
            });
            return;
          }

          console.log("User profile for admin check:", profile);

          if (profile?.role !== 'super_admin') {
            setError("Unauthorized access");
            toast({
              variant: "destructive",
              title: "Unauthorized",
              description: "You don't have permission to access this page.",
            });
          }
        }
      } catch (err) {
        console.error("Unexpected error checking admin access:", err);
        setError("An unexpected error occurred");
        toast({
          variant: "destructive",
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAccess();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="ml-72 min-h-screen bg-[#f4f4f4] dark:bg-[#161618] transition-colors duration-200">
        <TopNav />
        <main className="px-8 pt-24">
          <div className="max-w-5xl px-8">
            <p>Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ml-72 min-h-screen bg-[#f4f4f4] dark:bg-[#161618] transition-colors duration-200">
        <TopNav />
        <main className="px-8 pt-24">
          <div className="max-w-5xl px-8">
            <p className="text-red-500">{error}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="ml-72 min-h-screen bg-[#f4f4f4] dark:bg-[#161618] transition-colors duration-200">
      <TopNav />
      <main className="px-8 pt-24">
        <div className="max-w-5xl px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-[#000000] dark:text-gray-300">Admin Dashboard</h1>
            <CreateCustomerDialog onCustomerCreated={refetch} />
          </div>
          {customers && customers.length > 0 ? (
            <CustomersTable 
              customers={customers} 
              onCustomerUpdated={refetch}
              onDeleteCustomer={handleDeleteCustomer}
            />
          ) : (
            <p className="text-gray-500">No customers found.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminCustomers;