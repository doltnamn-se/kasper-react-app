import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

type URLStatusStep = "received" | "case_started" | "request_submitted" | "removal_approved";

export const useUrlSubmission = () => {
  const [urls, setUrls] = useState<string[]>(['']);
  const [isLoading, setIsLoading] = useState(false);
  const [existingUrls, setExistingUrls] = useState<any[]>([]);
  const [urlLimit, setUrlLimit] = useState(0);
  const { toast } = useToast();
  const { language } = useLanguage();

  useEffect(() => {
    fetchExistingUrls();
    fetchUrlLimit();
  }, []);

  const fetchUrlLimit = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      console.log('Fetching URL limit for user:', session.user.id);

      // Get user's URL limit from user_url_limits table
      const { data: urlLimitData, error: urlLimitError } = await supabase
        .from('user_url_limits')
        .select('additional_urls')
        .eq('customer_id', session.user.id)
        .single();

      if (urlLimitError) {
        console.error('Error fetching URL limit:', urlLimitError);
        return;
      }

      console.log('URL limit data:', urlLimitData);
      setUrlLimit(urlLimitData?.additional_urls || 0);
    } catch (error) {
      console.error('Error in fetchUrlLimit:', error);
    }
  };

  const fetchExistingUrls = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    console.log('Fetching existing URLs for user:', session.user.id);

    const { data, error } = await supabase
      .from('removal_urls')
      .select('*')
      .eq('customer_id', session.user.id);

    if (error) {
      console.error('Error fetching existing URLs:', error);
      return;
    }

    console.log('Existing URLs:', data);
    setExistingUrls(data || []);
  };

  const getUrlLimit = () => {
    return urlLimit;
  };

  const handleUrlChange = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  const addUrlField = () => {
    setUrls([...urls, '']);
  };

  const removeUrlField = (index: number) => {
    const newUrls = urls.filter((_, i) => i !== index);
    setUrls(newUrls);
  };

  const saveUrls = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const filteredUrls = urls.filter(url => url.trim() !== '');
      
      if (filteredUrls.length === 0) {
        toast({
          title: language === 'sv' ? 'Fel' : 'Error',
          description: language === 'sv' ? 'Ange minst en URL' : 'Enter at least one URL',
          variant: "destructive",
        });
        return;
      }

      const now = new Date().toISOString();
      const initialStatus: { step: URLStatusStep; timestamp: string } = {
        step: 'received',
        timestamp: now
      };

      const urlRows = filteredUrls.map(url => ({
        customer_id: user.id,
        url: url,
        status: 'pending',
        current_status: 'received' as URLStatusStep,
        status_history: [initialStatus],
        display_in_incoming: true
      }));

      const { error } = await supabase
        .from('removal_urls')
        .insert(urlRows);

      if (error) {
        console.error('Error saving URLs:', error);
        toast({
          title: language === 'sv' ? 'Fel' : 'Error',
          description: language === 'sv' ? 'Kunde inte spara URLer' : 'Could not save URLs',
          variant: "destructive",
        });
        return;
      }

      toast({
        title: language === 'sv' ? 'Klart' : 'Success',
        description: language === 'sv' ? 'URLer sparade' : 'URLs saved',
      });

      setUrls(['']);
      await fetchExistingUrls();
    } catch (error) {
      console.error('Error in saveUrls:', error);
      toast({
        title: language === 'sv' ? 'Fel' : 'Error',
        description: language === 'sv' ? 'Ett fel uppstod' : 'An error occurred',
        variant: "destructive",
      });
    }
  };

  return {
    urls,
    setUrls,
    handleUrlChange,
    addUrlField,
    removeUrlField,
    saveUrls,
    isLoading,
    setIsLoading,
    existingUrls,
    getUrlLimit
  };
};