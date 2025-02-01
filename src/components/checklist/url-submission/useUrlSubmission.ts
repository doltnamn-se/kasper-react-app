import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export const useUrlSubmission = () => {
  const [urls, setUrls] = useState<string[]>(['']);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch URL limits from the database
  const { data: urlLimits } = useQuery({
    queryKey: ['url-limits'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('No user session');

      console.log('Fetching URL limits for user:', session.user.id);

      // First check if the user has a subscription plan
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('subscription_plan')
        .eq('id', session.user.id)
        .single();
      
      if (customerError) {
        console.error('Error fetching customer data:', customerError);
        return { additional_urls: 0 };
      }

      console.log('Customer subscription plan:', customerData?.subscription_plan);

      // Then get the URL limits
      const { data, error } = await supabase
        .from('user_url_limits')
        .select('additional_urls')
        .eq('customer_id', session.user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching URL limits:', error);
        return { additional_urls: 0 };
      }

      // If no subscription plan, return 0
      if (!customerData?.subscription_plan) {
        console.log('No subscription plan found, returning 0 URLs');
        return { additional_urls: 0 };
      }

      // If no explicit limit set but has subscription, set default based on plan
      if (!data) {
        const defaultLimit = customerData.subscription_plan === '12_months' ? 4 : 
                           customerData.subscription_plan === '6_months' ? 2 : 0;
        console.log('No explicit limit found, using default limit:', defaultLimit);
        return { additional_urls: defaultLimit };
      }
      
      console.log('URL limits found:', data);
      return data;
    }
  });

  // Fetch existing URLs to count against the limit
  const { data: existingUrls } = useQuery({
    queryKey: ['existing-urls'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('No user session');

      console.log('Fetching existing URLs for user:', session.user.id);

      const { data, error } = await supabase
        .from('removal_urls')
        .select('url')
        .eq('customer_id', session.user.id);
      
      if (error) {
        console.error('Error fetching existing URLs:', error);
        throw error;
      }

      console.log('Found existing URLs:', data?.length || 0);
      return data || [];
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