import { MainLayout } from "@/components/layout/MainLayout";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { CustomersTable } from "@/components/admin/CustomersTable";
import { useLanguage } from "@/contexts/LanguageContext";
import { CustomerWithProfile } from "@/types/customer";
import { useCustomers } from "@/hooks/useCustomers";

const AdminCustomers = () => {
  const { t } = useLanguage();
  const { customers, isLoading, error, refetch } = useCustomers();

  if (error) {
    console.error('Error in AdminCustomers:', error);
    return (
      <MainLayout>
        <div>Error loading customers</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <h1 className="text-2xl font-normal text-[#000000] dark:text-white mb-6">
        {t('nav.admin.customers')}
      </h1>
      <AdminHeader onCustomerCreated={refetch} />
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <CustomersTable 
          customers={customers || []} 
          onCustomerUpdated={refetch}
          onDeleteCustomer={() => {}}
        />
      )}
    </MainLayout>
  );
};

export default AdminCustomers;