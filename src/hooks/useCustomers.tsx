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
      
      // First get the current user's profile to check role
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .single();

      if (profileError) {
        console.error("Error fetching user profile:", profileError);
        throw profileError;
      }

      console.log("Current user role:", userProfile?.role);

      // Fetch customers with their profiles using a join
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select(`
          *,
          profile:profiles!customers_profile_id_fkey (
            id,
            email,
            first_name,
            last_name,
            display_name,
            role
          )
        `);

      if (customersError) {
        console.error("Error fetching customers:", customersError);
        throw customersError;
      }

      console.log("Raw customers data:", customersData);

      // Transform the data to ensure each customer has a profile, even if empty
      const transformedData = customersData?.map(customer => ({
        ...customer,
        profile: customer.profile || {
          id: customer.id,
          email: null,
          first_name: null,
          last_name: null,
          display_name: null,
          role: 'No role'
        }
      })) || [];

      console.log("Transformed customers data:", transformedData);
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

  return {
    customers,
    isLoading,
    error,
    refetch,
    handleDeleteCustomer
  };
};