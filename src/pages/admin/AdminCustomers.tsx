
import { useLanguage } from "@/contexts/LanguageContext";
import { CustomerTable } from "@/components/admin/customers/CustomerTable";
import { useCustomers } from "@/components/admin/customers/useCustomers";
import { useCustomerPresence } from "@/components/admin/customers/useCustomerPresence";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { useIsMobile } from "@/hooks/use-mobile";

const AdminCustomers = () => {
  const { t } = useLanguage();
  const { customers, isLoading, fetchCustomers } = useCustomers();
  const { onlineUsers, lastSeen } = useCustomerPresence();
  const isMobile = useIsMobile();

  return (
    <div className={`w-full ${isMobile ? "px-0" : ""}`}>
      <div className={`flex justify-between items-center mb-6 ${isMobile ? "px-4" : ""}`}>
        <h1 className="text-2xl font-bold tracking-[-.416px] text-[#000000] dark:text-white">
          {t('nav.admin.customers')}
        </h1>
        
        <AdminHeader onCustomerCreated={fetchCustomers} />
      </div>

      <div className="shadow-sm transition-colors duration-200">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
          </div>
        ) : customers.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300 text-center py-8">
            No customers found.
          </p>
        ) : (
          <CustomerTable 
            customers={customers}
            onlineUsers={onlineUsers}
            lastSeen={lastSeen}
            onRefresh={fetchCustomers}
          />
        )}
      </div>
    </div>
  );
};

export default AdminCustomers;
