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

      const { data, error } = await supabase
        .from('user_url_limits')
        .select('additional_urls')
        .eq('customer_id', session.user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching URL limits:', error);
        return { additional_urls: 0 };
      }
      
      return data || { additional_urls: 0 };
    }
  });

  // Fetch existing URLs to count against the limit
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
    return urlLimits?.additional_urls || 0;
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