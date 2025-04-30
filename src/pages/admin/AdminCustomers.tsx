
import { useLanguage } from "@/contexts/LanguageContext";
import { CustomerTable } from "@/components/admin/customers/CustomerTable";
import { useCustomers } from "@/components/admin/customers/useCustomers";
import { useCustomerPresence } from "@/components/admin/customers/useCustomerPresence";
import { CustomerView } from "@/components/admin/customers/CustomerView";
import { CustomerWithProfile } from "@/types/customer";
import { useState } from "react";

const AdminCustomers = () => {
  const { t } = useLanguage();
  const { customers, isLoading, fetchCustomers } = useCustomers();
  const { onlineUsers, lastSeen } = useCustomerPresence();
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithProfile | null>(null);

  const handleSelectCustomer = (customer: CustomerWithProfile) => {
    setSelectedCustomer(customer);
  };

  const handleBack = () => {
    setSelectedCustomer(null);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-[-.416px] text-[#000000] dark:text-white mb-6">
        {t('nav.admin.customers')}
      </h1>

      <div className="shadow-sm transition-colors duration-200">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
          </div>
        ) : customers.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300 text-center py-8">
            No customers found.
          </p>
        ) : selectedCustomer ? (
          <CustomerView 
            customer={selectedCustomer}
            onBack={handleBack}
          />
        ) : (
          <CustomerTable 
            customers={customers}
            onlineUsers={onlineUsers}
            lastSeen={lastSeen}
            onRefresh={fetchCustomers}
            onSelectCustomer={handleSelectCustomer}
          />
        )}
      </div>
    </div>
  );
};

export default AdminCustomers;
