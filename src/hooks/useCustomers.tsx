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
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          role,
          email,
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

      const transformedData = customersData?.map(profile => {
        console.log("Profile data:", profile); // Add this log to debug profile data
        return {
          ...profile.customers?.[0],
          profile: {
            id: profile.id,
            first_name: profile.first_name,
            last_name: profile.last_name,
            role: profile.role,
            email: profile.email,
            created_at: profile.created_at,
            updated_at: profile.updated_at
          }
        };
      }) || [];

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