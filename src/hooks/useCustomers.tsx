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
        console.log("Starting customers fetch...");
        
        // First verify session and admin status
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error("No active session");
        }

        // Fetch customers first
        console.log("Fetching customers data...");
        const { data: customersData, error: customersError } = await supabase
          .from('customers')
          .select('*')
          .order('created_at', { ascending: false });

        if (customersError) {
          console.error("Error fetching customers:", customersError);
          throw customersError;
        }

        if (!customersData) {
          console.log("No customers found");
          return [];
        }

        // Then fetch all corresponding profiles
        console.log("Fetching profiles for customers...");
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .in('id', customersData.map(customer => customer.id));

        if (profilesError) {
          console.error("Error fetching profiles:", profilesError);
          throw profilesError;
        }

        // Combine the data
        const transformedData = customersData.map(customer => ({
          ...customer,
          profile: profilesData?.find(profile => profile.id === customer.id) || null
        }));

        console.log("Successfully fetched and combined data:", transformedData);
        return transformedData as CustomerWithProfile[];
      } catch (error: any) {
        console.error("Error in customers fetch:", error);
        throw new Error(error.message || "Failed to fetch customers data");
      }
    },
    retry: 2, // Retry failed requests up to 2 times
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: false // Don't refetch when window regains focus
  });

  const handleDeleteCustomer = async (customerId: string) => {
    try {
      console.log("Starting deletion process for customer:", customerId);

      // Delete from notification_preferences
      const { error: notifPrefError } = await supabase
        .from('notification_preferences')
        .delete()
        .eq('user_id', customerId);

      if (notifPrefError) {
        console.error("Error deleting notification preferences:", notifPrefError);
        throw notifPrefError;
      }

      // Delete from notifications
      const { error: notifError } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', customerId);

      if (notifError) {
        console.error("Error deleting notifications:", notifError);
        throw notifError;
      }

      // Delete from hiding_preferences
      const { error: hidingPrefError } = await supabase
        .from('hiding_preferences')
        .delete()
        .eq('customer_id', customerId);

      if (hidingPrefError) {
        console.error("Error deleting hiding preferences:", hidingPrefError);
        throw hidingPrefError;
      }

      // Delete from removal_urls
      const { error: removalUrlsError } = await supabase
        .from('removal_urls')
        .delete()
        .eq('customer_id', customerId);

      if (removalUrlsError) {
        console.error("Error deleting removal URLs:", removalUrlsError);
        throw removalUrlsError;
      }

      // Delete from profiles
      const { error: profilesError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', customerId);

      if (profilesError) {
        console.error("Error deleting profile:", profilesError);
        throw profilesError;
      }

      // Delete from customers
      const { error: customersError } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId);

      if (customersError) {
        console.error("Error deleting customer:", customersError);
        throw customersError;
      }

      console.log("Customer deleted successfully");
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