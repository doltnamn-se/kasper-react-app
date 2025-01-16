import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { CustomerWithProfile } from "@/types/customer";
import { CustomersTable } from "@/components/admin/CustomersTable";
import { useQuery } from "@tanstack/react-query";
import { CreateCustomerDialog } from "@/components/admin/CreateCustomerDialog";

const AdminCustomers = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: customers, refetch } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      console.log("Fetching customers...");
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select(`
          *,
          profile:profiles (
            id,
            first_name,
            last_name,
            role,
            created_at,
            updated_at
          )
        `);

      if (customersError) {
        console.error("Error fetching customers:", customersError);
        throw customersError;
      }

      console.log("Customers fetched:", customersData);
      return customersData as CustomerWithProfile[];
    }
  });

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
      <div className="p-8">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <CreateCustomerDialog onCustomerCreated={refetch} />
      </div>
      {customers && customers.length > 0 ? (
        <CustomersTable customers={customers} onCustomerUpdated={refetch} />
      ) : (
        <p className="text-gray-500">No customers found.</p>
      )}
    </div>
  );
};

export default AdminCustomers;