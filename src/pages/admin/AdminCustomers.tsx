import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { CustomersTable } from "@/components/admin/CustomersTable";
import { MainLayout } from "@/components/layout/MainLayout";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { useCustomers } from "@/hooks/useCustomers";

const AdminCustomers = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { 
    customers, 
    isLoading: customersLoading, 
    error: customersError,
    refetch,
    handleDeleteCustomer 
  } = useCustomers();

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

  if (isLoading || customersLoading) {
    return (
      <MainLayout>
        <p>Loading...</p>
      </MainLayout>
    );
  }

  if (error || customersError) {
    return (
      <MainLayout>
        <p className="text-red-500">{error || "Error loading customers"}</p>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <AdminHeader onCustomerCreated={refetch} />
      {customers && customers.length > 0 ? (
        <CustomersTable 
          customers={customers} 
          onCustomerUpdated={refetch}
          onDeleteCustomer={handleDeleteCustomer}
        />
      ) : (
        <p className="text-gray-500">No customers found.</p>
      )}
    </MainLayout>
  );
};

export default AdminCustomers;