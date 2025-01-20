import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CustomerWithProfile } from "@/types/customer";
import { useToast } from "@/hooks/use-toast";

export const useCustomers = () => {
  const { toast } = useToast();

  const { data: customers, refetch, isLoading, error } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      console.log("Fetching customers...");
      
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select(`
          *,
          profile:profiles (
            email,
            display_name,
            role
          )
        `);

      if (customersError) {
        console.error("Error fetching customers:", customersError);
        throw customersError;
      }

      console.log("Raw customers data:", customersData);

      const transformedData = customersData?.map(customer => ({
        ...customer,
        profile: customer.profile || {
          email: null,
          display_name: null,
          role: null
        }
      })) || [];

      console.log("Transformed customers data:", transformedData);
      return transformedData as CustomerWithProfile[];
    }
  });

  const handleDeleteCustomer = async (customerId: string) => {
    try {
      console.log("Starting deletion process for customer:", customerId);

      // First delete from profiles table
      const { error: profilesError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', customerId);

      if (profilesError) {
        console.error("Error deleting profile:", profilesError);
        throw profilesError;
      }

      // Then delete from customers table
      const { error: customersError } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId);

      if (customersError) {
        console.error("Error deleting customer:", customersError);
        throw customersError;
      }

      // Finally delete the auth user using admin API
      const { error: authError } = await supabase.auth.admin.deleteUser(
        customerId
      );

      if (authError) {
        console.error("Error deleting auth user:", authError);
        throw authError;
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
        description: "Failed to delete customer. Please try again.",
      });
    }
  };

  return {
    customers,
    isLoading,
    error,
    refetch,
    handleDeleteCustomer
  };
};