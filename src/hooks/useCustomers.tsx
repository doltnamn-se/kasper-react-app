import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CustomerWithProfile } from "@/types/customer";
import { useToast } from "@/hooks/use-toast";

export const useCustomers = () => {
  const { toast } = useToast();

  const { data: customers, refetch, isLoading, error } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      console.log("Starting customers fetch...");
      
      // First check if user is authenticated
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error("Session error:", sessionError);
        throw sessionError;
      }
      
      if (!session) {
        console.error("No session found");
        throw new Error("No session found");
      }
      
      console.log("User authenticated, fetching user profile...");
      
      // Check user role
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
        
      if (profileError) {
        console.error("Error fetching user profile:", profileError);
        throw profileError;
      }
      
      console.log("User role:", userProfile?.role);
      
      if (userProfile?.role !== 'super_admin') {
        throw new Error("Unauthorized: Only super admins can access this resource");
      }

      // Fetch customers with their profiles in a single query
      const { data, error: fetchError } = await supabase
        .from('customers')
        .select(`
          *,
          profile:profiles!customers_id_fkey (
            id,
            email,
            display_name,
            role,
            created_at,
            updated_at,
            first_name,
            last_name
          )
        `);

      if (fetchError) {
        console.error("Error fetching customers:", fetchError);
        throw fetchError;
      }

      console.log("Fetched customers with profiles:", data);
      
      // Transform the data to match our expected type
      const transformedData = data?.map(customer => ({
        ...customer,
        profile: customer.profile || null
      })) || [];

      return transformedData as CustomerWithProfile[];
    }
  });

  const handleDeleteCustomer = async (customerId: string) => {
    try {
      console.log("Starting deletion process for customer:", customerId);

      // First delete from notification_preferences
      const { error: notifPrefError } = await supabase
        .from('notification_preferences')
        .delete()
        .eq('user_id', customerId);

      if (notifPrefError) {
        console.error("Error deleting notification preferences:", notifPrefError);
        throw notifPrefError;
      }

      // Then delete from notifications
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