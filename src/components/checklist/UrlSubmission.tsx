import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";

interface UrlSubmissionProps {
  onComplete: () => void;
}

export const UrlSubmission = ({ onComplete }: UrlSubmissionProps) => {
  const [urls, setUrls] = useState<string[]>(['']);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  // Fetch customer subscription plan
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

  const urlLimit = getUrlLimit();

  const handleUrlChange = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  const addUrlField = () => {
    if (urls.length >= urlLimit) {
      toast({
        title: "URL limit reached",
        description: t('url.limit.message', { limit: urlLimit }),
        variant: "destructive",
      });
      return;
    }
    setUrls([...urls, '']);
  };

  const removeUrlField = (index: number) => {
    const newUrls = urls.filter((_, i) => i !== index);
    setUrls(newUrls);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('No user session');

      // Filter out empty URLs
      const validUrls = urls.filter(url => url.trim() !== '');
      
      // Check if the number of valid URLs exceeds the limit
      if (validUrls.length > urlLimit) {
        throw new Error(t('url.limit.message', { limit: urlLimit }));
      }

      // Check if user has no URL allowance
      if (urlLimit === 0) {
        throw new Error(t('url.no.plan'));
      }

      // First update the checklist progress
      const { error: progressError } = await supabase
        .from('customer_checklist_progress')
        .update({ removal_urls: validUrls })
        .eq('customer_id', session.user.id);

      if (progressError) throw progressError;

      // Then insert into removal_urls table
      // First delete existing URLs
      const { error: deleteError } = await supabase
        .from('removal_urls')
        .delete()
        .eq('customer_id', session.user.id);

      if (deleteError) throw deleteError;

      // Then insert new URLs
      const urlRows = validUrls.map(url => ({
        customer_id: session.user.id,
        url,
        display_in_incoming: true
      }));

      const { error: urlsError } = await supabase
        .from('removal_urls')
        .insert(urlRows);

      if (urlsError) throw urlsError;

      toast({
        title: "URLs saved",
        description: "Your URLs have been successfully saved.",
      });
      
      onComplete();
    } catch (error: any) {
      console.error('Error saving URLs:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save URLs. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (urlLimit === 0) {
    return (
      <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          {t('url.no.plan')}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-sm text-[#000000A6] dark:text-[#FFFFFFA6] mb-4">
        {t('url.limit.message', { limit: urlLimit })}
      </div>
      
      {urls.map((url, index) => (
        <div key={index} className="flex gap-2">
          <Input
            type="url"
            placeholder={t('url.input.placeholder')}
            value={url}
            onChange={(e) => handleUrlChange(index, e.target.value)}
            required
          />
          {urls.length > 1 && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => removeUrlField(index)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
      
      {urls.length < urlLimit && (
        <Button
          type="button"
          variant="outline"
          onClick={addUrlField}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('url.add.another')}
        </Button>
      )}
      
      <Button
        type="submit"
        disabled={isLoading || urls.every(url => url.trim() === '') || urls.length > urlLimit}
        className="w-full py-6"
      >
        {isLoading ? t('saving') : t('save.urls')}
      </Button>
    </form>
  );
};