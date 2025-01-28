import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export const useUrlSubmission = () => {
  const [urls, setUrls] = useState<string[]>(['']);
  const [isLoading, setIsLoading] = useState(false);

  const { data: customerData } = useQuery({
    queryKey: ['customer'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('No user session');

      const { data, error } = await supabase
        .from('customers')
        .select('subscription_plan')
        .eq('id', session.user.id)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  const { data: existingUrls } = useQuery({
    queryKey: ['existing-urls'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('No user session');

      const { data, error } = await supabase
        .from('removal_urls')
        .select('url')
        .eq('customer_id', session.user.id);
      
      if (error) throw error;
      return data || [];
    }
  });

  const getUrlLimit = () => {
    switch (customerData?.subscription_plan) {
      case '6_months':
        return 2;
      case '12_months':
        return 4;
      default:
        return 0;
    }
  };

  return {
    urls,
    setUrls,
    isLoading,
    setIsLoading,
    customerData,
    existingUrls,
    getUrlLimit,
  };
};