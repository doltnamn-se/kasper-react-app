import { MainLayout } from "@/components/layout/MainLayout";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { useLanguage } from "@/contexts/LanguageContext";
import { CreateCustomerDialog } from "@/components/admin/CreateCustomerDialog";

const AdminCustomers = () => {
  const { t } = useLanguage();

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-[-.416px] text-[#000000] dark:text-white">
          {t('nav.admin.customers')}
        </h1>
        <CreateCustomerDialog onCustomerCreated={() => {}} />
      </div>
    </MainLayout>
  );
};

export default AdminCustomers;