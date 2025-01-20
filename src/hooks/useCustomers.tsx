import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CustomerWithProfile } from "@/types/customer";
import { useToast } from "@/hooks/use-toast";

export const useCustomers = () => {
  const { toast } = useToast();

  const { data: customers, refetch, isLoading, error } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      try {
        console.log("Fetching customers and profiles...");
        
        const { data: customersWithProfiles, error } = await supabase
          .from('customers')
          .select(`
            *,
            profile:profiles(*)
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching customers:", error);
          throw error;
        }

        console.log("Successfully fetched customers data:", customersWithProfiles);
        return customersWithProfiles as CustomerWithProfile[];
      } catch (error: any) {
        console.error("Error in customers fetch:", error);
        throw new Error(error.message || "Failed to fetch customers data");
      }
    },
    staleTime: 30000,
    refetchOnWindowFocus: false
  });

  const handleDeleteCustomer = async (customerId: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Customer deleted successfully",
      });
      
      refetch();
    } catch (err: any) {
      console.error("Error deleting customer:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to delete customer",
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