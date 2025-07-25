
import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { CustomerTable } from "@/components/admin/customers/CustomerTable";
import { useCustomers } from "@/components/admin/customers/useCustomers";
import { useCustomerPresence } from "@/components/admin/customers/useCustomerPresence";
import { CreateCustomerDialog } from "@/components/admin/CreateCustomerDialog";
import { Button } from "@/components/ui/button";
import { UserRoundPlus } from "lucide-react";

const AdminCustomers = () => {
  const { t } = useLanguage();
  
  useEffect(() => {
    document.title = "Admin | Kasper";
  }, []);
  const { customers, isLoading, fetchCustomers } = useCustomers();
  const { onlineUsers, lastSeen } = useCustomerPresence();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-[-.416px] text-[#000000] dark:text-white">
          {t('nav.admin.customers')}
        </h1>
        
        <CreateCustomerDialog onCustomerCreated={fetchCustomers}>
          <Button 
            className="
              text-[#000000] bg-[#72e3ad] border-[#16b674bf] hover:bg-[#3fcf8ecc] hover:border-[#097c4f]
              dark:text-white dark:bg-[#006239] dark:border-[#3ecf8e4d] dark:hover:bg-[#3ecf8e80] dark:hover:border-[#3ecf8e]
              border flex items-center gap-2 text-xs rounded-md h-8 px-[0.625rem]
            "
          >
            <UserRoundPlus className="[&.lucide]:h-3.5 [&.lucide]:w-3.5 text-[#097c4f] dark:text-[#85e0ba]" />
            {t('add.customer')}
          </Button>
        </CreateCustomerDialog>
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
