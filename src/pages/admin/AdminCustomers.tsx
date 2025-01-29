import { useLanguage } from "@/contexts/LanguageContext";

const AdminCustomers = () => {
  const { t } = useLanguage();

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-[-.416px] text-[#000000] dark:text-white mb-6">
        {t('nav.admin.customers')}
      </h1>
      <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[4px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
        {/* Customer management functionality will go here */}
        <p className="text-gray-600 dark:text-gray-300">
          Customer management dashboard coming soon.
        </p>
      </div>
    </div>
  );
};

export default AdminCustomers;