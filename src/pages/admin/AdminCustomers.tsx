import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { CustomersTable } from "@/components/admin/CustomersTable";
import { useLanguage } from "@/contexts/LanguageContext";
import { Customer } from "@/types/customer";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const AdminCustomers = () => {
  const { t } = useLanguage();
  const [customers, setCustomers] = useState<Customer[]>([]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      console.log('Fetching customers...');
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select(`
          *,
          profiles (
            first_name,
            last_name,
            role
          ),
          subscriptions (
            status,
            stripe_price_id
          )
        `);

      if (customersError) {
        console.error('Error fetching customers:', customersError);
        throw customersError;
      }

      console.log('Customers data:', customersData);
      return customersData;
    }
  });

  useEffect(() => {
    if (data) {
      const formattedCustomers = data.map((customer: any) => ({
        id: customer.id,
        firstName: customer.profiles?.first_name || '',
        lastName: customer.profiles?.last_name || '',
        role: customer.profiles?.role || 'customer',
        onboardingCompleted: customer.onboarding_completed || false,
        subscriptionStatus: customer.subscriptions?.[0]?.status || 'inactive',
        subscriptionPlan: customer.subscriptions?.[0]?.stripe_price_id || null,
        stripeCustomerId: customer.stripe_customer_id || null,
        createdAt: customer.created_at,
      }));
      
      console.log('Formatted customers:', formattedCustomers);
      setCustomers(formattedCustomers);
    }
  }, [data]);

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
          customers={customers} 
          onCustomerUpdated={refetch}
        />
      )}
    </MainLayout>
  );
};

export default AdminCustomers;