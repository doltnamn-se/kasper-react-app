
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CustomerRegistrationData, SubscriptionData } from '@/types/admin';
import { handleQueryResult } from '@/utils/supabaseHelpers';
import { addDays, addMonths, addWeeks, addYears, startOfMonth, startOfYear, subYears } from 'date-fns';

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

      // Since "customer_registrations_over_time" doesn't exist, we'll use the profiles table
      // to generate registration data based on created_at
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('created_at')
        .order('created_at');

      if (profilesError) {
        console.error("Error fetching profiles for registration data:", profilesError);
      } else if (profilesData) {
        // Process profiles data to create registration over time data
        const registrationMap = new Map<string, number>();
        
        profilesData.forEach(profile => {
          // Extract the date part only (YYYY-MM-DD)
          const dateStr = new Date(profile.created_at).toISOString().split('T')[0];
          
          // Increment count for this date
          const currentCount = registrationMap.get(dateStr) || 0;
          registrationMap.set(dateStr, currentCount + 1);
        });
        
        // Convert map to array and sort by date
        const registrationData: CustomerRegistrationData[] = Array.from(registrationMap.entries())
          .map(([registration_date, count]) => ({ registration_date, count }))
          .sort((a, b) => a.registration_date.localeCompare(b.registration_date));
        
        setCustomerRegistrationData(registrationData);
      }

      // For subscription data, use customers table and group by subscription_plan
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('subscription_plan, customer_type');

      if (customerError) {
        console.error("Error fetching customer subscription data:", customerError);
      } else if (customerData) {
        // Process customers data to create subscription distribution
        const planMap = new Map<string, number>();
        
        customerData.forEach(customer => {
          const plan = customer.subscription_plan || 'none';
          const currentCount = planMap.get(plan) || 0;
          planMap.set(plan, currentCount + 1);
        });
        
        // Convert map to array
        const subscriptionDistribution: SubscriptionData[] = Array.from(planMap.entries())
          .map(([plan, count]) => ({ plan, count }));
        
        setSubscriptionData(subscriptionDistribution);
      }

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter customer registration data by time range
  const filterCustomerDataByTimeRange = (
    data: CustomerRegistrationData[],
    timeRange: 'alltime' | 'ytd' | 'mtd' | '1year' | '4weeks' | '1week'
  ): CustomerRegistrationData[] => {
    if (timeRange === 'alltime' || !data.length) return data;
    
    const now = new Date();
    let cutoffDate: Date;
    
    switch (timeRange) {
      case 'ytd':
        cutoffDate = startOfYear(now);
        break;
      case 'mtd':
        cutoffDate = startOfMonth(now);
        break;
      case '1year':
        cutoffDate = subYears(now, 1);
        break;
      case '4weeks':
        cutoffDate = addDays(now, -28);
        break;
      case '1week':
        cutoffDate = addDays(now, -7);
        break;
      default:
        return data;
    }
    
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0];
    
    return data.filter(item => item.registration_date >= cutoffDateStr);
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
    fetchDashboardData,
    filterCustomerDataByTimeRange
  };
};
