import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface UrlLimits {
  additional_urls: number;
}

const fetchCustomerSubscription = async (userId: string) => {
  const { data, error } = await supabase
    .from('customers')
    .select('subscription_plan')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching customer data:', error);
    return null;
  }
  
  console.log('Customer subscription plan:', data?.subscription_plan);
  return data;
};

const getDefaultUrlLimit = (subscriptionPlan: string | null): number => {
  if (!subscriptionPlan) return 0;
  
  return subscriptionPlan === '12_months' ? 4 : 
         subscriptionPlan === '6_months' ? 2 : 0;
};

const fetchUrlLimits = async (userId: string): Promise<UrlLimits> => {
  console.log('Fetching URL limits for user:', userId);

  // First get subscription plan
  const customerData = await fetchCustomerSubscription(userId);
  if (!customerData?.subscription_plan) {
    console.log('No subscription plan found, returning 0 URLs');
    return { additional_urls: 0 };
  }

  // Then get explicit URL limits if they exist
  const { data: urlLimits, error } = await supabase
    .from('user_url_limits')
    .select('additional_urls')
    .eq('customer_id', userId)
    .maybeSingle();
  
  if (error) {
    console.error('Error fetching URL limits:', error);
    return { additional_urls: 0 };
  }

  // If no explicit limit set, use default based on plan
  if (!urlLimits) {
    const defaultLimit = getDefaultUrlLimit(customerData.subscription_plan);
    console.log('No explicit limit found, using default limit:', defaultLimit);
    return { additional_urls: defaultLimit };
  }
  
  console.log('URL limits found:', urlLimits);
  return urlLimits;
};

const fetchExistingUrls = async (userId: string) => {
  console.log('Fetching existing URLs for user:', userId);

  const { data, error } = await supabase
    .from('removal_urls')
    .select('url')
    .eq('customer_id', userId);
  
  if (error) {
    console.error('Error fetching existing URLs:', error);
    throw error;
  }

  console.log('Found existing URLs:', data?.length || 0);
  return data || [];
};

export const useUrlSubmission = () => {
  const [urls, setUrls] = useState<string[]>(['']);
  const [isLoading, setIsLoading] = useState(false);

  const { data: urlLimits } = useQuery({
    queryKey: ['url-limits'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('No user session');
      return fetchUrlLimits(session.user.id);
    }
  });

  const { data: existingUrls } = useQuery({
    queryKey: ['existing-urls'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('No user session');
      return fetchExistingUrls(session.user.id);
    }
  });

  const getUrlLimit = () => {
    const limit = urlLimits?.additional_urls || 0;
    console.log('Current URL limit:', limit);
    return limit;
  };

  return {
    urls,
    setUrls,
    isLoading,
    setIsLoading,
    existingUrls,
    getUrlLimit,
  };
};