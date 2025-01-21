import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { CreateCustomerDialog } from "@/components/admin/CreateCustomerDialog";
import { CustomersTable } from "@/components/admin/CustomersTable";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CustomerWithProfile } from "@/types/customer";
import { useToast } from "@/hooks/use-toast";

const AdminCustomers = () => {
  const { t } = useLanguage();
  const { toast } = useToast();

  const { data: customers, refetch } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      console.log('Fetching customers...');
      const { data: customers, error } = await supabase
        .from('customers')
        .select(`
          *,
          profile:profiles(*)
        `);

      if (error) {
        console.error('Error fetching customers:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch customers",
        });
        throw error;
      }

      console.log('Customers fetched successfully:', customers);
      return customers as CustomerWithProfile[];
    },
  });

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