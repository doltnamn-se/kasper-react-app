import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { CreateCustomerDialog } from "@/components/admin/CreateCustomerDialog";

const AdminDashboard = () => {
  const { t } = useLanguage();

  const handleCustomerCreated = () => {
    console.log('Customer created successfully');
  };

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-[-.416px] text-[#000000] dark:text-white">
          {t('nav.admin.dashboard')}
        </h1>
        <CreateCustomerDialog onCustomerCreated={handleCustomerCreated} />
      </div>
      <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[4px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
        <p className="text-gray-600 dark:text-gray-300">
          Välkommen till din översikt.
        </p>
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;