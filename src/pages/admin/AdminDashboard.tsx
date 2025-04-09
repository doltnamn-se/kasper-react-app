
import { useLanguage } from "@/contexts/LanguageContext";
import { useAdminDashboardData } from "@/hooks/useAdminDashboardData";
import { CustomerTypeCards } from "@/components/admin/dashboard/CustomerTypeCards";

const AdminDashboard = () => {
  const { t } = useLanguage();
  const { 
    totalCustomers, 
    isLoading,
    getSubscriptionDataForType 
  } = useAdminDashboardData();

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-[-.416px] text-[#000000] dark:text-white mb-6">
        {t('nav.admin.dashboard')}
      </h1>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Three main cards with subscription breakdowns */}
        <CustomerTypeCards 
          totalCustomers={totalCustomers} 
          getSubscriptionDataForType={getSubscriptionDataForType}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
