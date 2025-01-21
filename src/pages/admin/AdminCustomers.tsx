import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { CreateCustomerDialog } from "@/components/admin/CreateCustomerDialog";
import { CustomersTable } from "@/components/admin/CustomersTable";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CustomerWithProfile } from "@/types/customer";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

const AdminCustomers = () => {
  const { t } = useLanguage();
  const { toast } = useToast();

  const { data: customers, refetch } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      console.log('Fetching customers...');
      
      // First fetch customers
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*');

      if (customersError) {
        console.error('Error fetching customers:', customersError);
        throw customersError;
      }

      // Then fetch profiles for these customers
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', customersData.map(customer => customer.id));

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      // Combine the data
      const customersWithProfiles = customersData.map(customer => ({
        ...customer,
        profile: profilesData.find(profile => profile.id === customer.id) || null
      }));

      console.log('Customers with profiles:', customersWithProfiles);
      return customersWithProfiles as CustomerWithProfile[];
    },
    meta: {
      onError: (error: Error) => {
        console.error('Error in customers query:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch customers",
        });
      },
    },
  });

  // Set up real-time subscription
  useEffect(() => {
    console.log('Setting up real-time subscription...');
    
    const customersSubscription = supabase
      .channel('customers-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'customers' 
        }, 
        () => {
          console.log('Customers table changed, refetching...');
          refetch();
        }
      )
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'profiles' 
        }, 
        () => {
          console.log('Profiles table changed, refetching...');
          refetch();
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up real-time subscription...');
      customersSubscription.unsubscribe();
    };
  }, [refetch]);

  const handleDeleteCustomer = async (customerId: string) => {
    try {
      console.log('Deleting customer:', customerId);
      const { error } = await supabase.auth.admin.deleteUser(customerId);
      
      if (error) {
        console.error('Error deleting customer:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete customer",
        });
        return;
      }

      console.log('Customer deleted successfully');
      toast({
        title: "Success",
        description: "Customer deleted successfully",
      });
      refetch();
    } catch (error) {
      console.error('Error in handleDeleteCustomer:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      });
    }
  };

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-[-.416px] text-[#000000] dark:text-white">
          {t('nav.admin.customers')}
        </h1>
        <CreateCustomerDialog onCustomerCreated={refetch} />
      </div>
      <CustomersTable 
        customers={customers || []} 
        onCustomerUpdated={refetch}
        onDeleteCustomer={handleDeleteCustomer}
      />
    </MainLayout>
  );
};

export default AdminCustomers;