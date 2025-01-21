import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CustomersTable } from "@/components/admin/CustomersTable";
import { CustomerWithProfile } from "@/types/customer";

const AdminCustomers = () => {
  const { t } = useLanguage();

  const { data: customers = [], refetch } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      console.log('Fetching profiles for admin view...');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'customer');

      if (error) {
        console.error('Error fetching profiles:', error);
        throw error;
      }

      return data.map(profile => ({
        id: profile.id,
        profile: profile,
        created_at: profile.created_at,
      })) as CustomerWithProfile[];
    },
  });

  const handleCustomerUpdated = () => {
    refetch();
  };

  const handleDeleteCustomer = async (customerId: string) => {
    try {
      const { error } = await supabase.auth.admin.deleteUser(customerId);
      if (error) throw error;
      refetch();
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-[-.416px] text-[#000000] dark:text-white">
          {t('nav.admin.customers')}
        </h1>
      </div>
      <CustomersTable 
        customers={customers} 
        onCustomerUpdated={handleCustomerUpdated}
        onDeleteCustomer={handleDeleteCustomer}
      />
    </MainLayout>
  );
};

export default AdminCustomers;