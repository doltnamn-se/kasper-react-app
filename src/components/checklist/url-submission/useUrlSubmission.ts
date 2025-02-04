import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

type URLStatusStep = "received" | "case_started" | "request_submitted" | "removal_approved";

export const useUrlSubmission = () => {
  const [urls, setUrls] = useState<string[]>(['']);
  const [isLoading, setIsLoading] = useState(false);
  const [existingUrls, setExistingUrls] = useState<any[]>([]);
  const { toast } = useToast();
  const { language } = useLanguage();

  useEffect(() => {
    fetchExistingUrls();
  }, []);

  const fetchExistingUrls = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { data } = await supabase
      .from('removal_urls')
      .select('*')
      .eq('customer_id', session.user.id);

    setExistingUrls(data || []);
  };

  const getUrlLimit = () => {
    // Basic limit is 3 URLs
    return 3;
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
    const initialStatus = {
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