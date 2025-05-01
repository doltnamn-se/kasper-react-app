
import { useLanguage } from "@/contexts/LanguageContext";
import { CustomerTable } from "@/components/admin/customers/CustomerTable";
import { useCustomers } from "@/components/admin/customers/useCustomers";
import { useCustomerPresence } from "@/components/admin/customers/useCustomerPresence";
import { Button } from "@/components/ui/button";
import { useAddressSync } from "@/components/admin/customers/hooks/useAddressSync";

const AdminCustomers = () => {
  const { t } = useLanguage();
  const { customers, isLoading, fetchCustomers } = useCustomers();
  const { onlineUsers, lastSeen } = useCustomerPresence();
  const { isSyncing, syncAddressForAllCustomers } = useAddressSync();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-[-.416px] text-[#000000] dark:text-white">
          {t('nav.admin.customers')}
        </h1>
        
        <div className="space-x-2">
          <Button 
            variant="outline"
            size="sm"
            onClick={syncAddressForAllCustomers}
            disabled={isSyncing}
          >
            {isSyncing ? "Syncing Addresses..." : "Sync All Addresses"}
          </Button>
        </div>
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
