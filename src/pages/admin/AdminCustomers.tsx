import { MainLayout } from "@/components/layout/MainLayout";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { CustomersTable } from "@/components/admin/CustomersTable";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCustomers } from "@/hooks/useCustomers";
import { CreateCustomerDialog } from "@/components/admin/CreateCustomerDialog";

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-[-.416px] text-[#000000] dark:text-white">
          {t('nav.admin.customers')}
        </h1>
        <CreateCustomerDialog onCustomerCreated={refetch} />
      </div>
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