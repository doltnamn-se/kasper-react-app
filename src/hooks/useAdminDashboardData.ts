import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CustomerRegistrationData, SubscriptionData } from '@/types/admin';

export const useAdminDashboardData = () => {
  const [totalCustomers, setTotalCustomers] = useState<number>(0);
  const [customerRegistrationData, setCustomerRegistrationData] = useState<CustomerRegistrationData[]>([]);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch total customers
      const { count: customersCount, error: customersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' });

      if (customersError) {
        console.error("Error fetching total customers:", customersError);
      } else {
        setTotalCustomers(customersCount || 0);
      }

      // Fetch customer registration data over time
      const { data: registrationData, error: registrationError } = await supabase
        .from('customer_registrations_over_time')
        .select('*')
        .order('registration_date');

      if (registrationError) {
        console.error("Error fetching customer registration data:", registrationError);
      } else {
        setCustomerRegistrationData(registrationData || []);
      }

      // Fetch subscription data
      const { data: subscriptionDataResult, error: subscriptionError } = await supabase
        .from('subscription_distribution')
        .select('*');

      if (subscriptionError) {
        console.error("Error fetching subscription data:", subscriptionError);
      } else {
        setSubscriptionData(subscriptionDataResult || []);
      }

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getSubscriptionDataForType = (type: 'all' | 'private' | 'business'): SubscriptionData[] => {
    if (type === 'all') {
      return subscriptionData;
    }

    return subscriptionData.filter(item => item.customer_type === type);
  };

  return {
    totalCustomers,
    customerRegistrationData,
    subscriptionData,
    isLoading,
    getSubscriptionDataForType,
    fetchDashboardData
  };
};
