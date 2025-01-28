import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { UrlInput } from "./url-submission/UrlInput";
import { UpgradePrompt } from "./url-submission/UpgradePrompt";
import { useUrlSubmission } from "./url-submission/useUrlSubmission";

interface UrlSubmissionProps {
  onComplete: () => void;
}

export const UrlSubmission = ({ onComplete }: UrlSubmissionProps) => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const {
    urls,
    setUrls,
    isLoading,
    setIsLoading,
    customerData,
    existingUrls,
    getUrlLimit
  } = useUrlSubmission();

  const urlLimit = getUrlLimit();

  const handleUrlChange = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  const addUrlField = () => {
    const currentValidUrls = urls.filter(url => url.trim() !== '');
    const existingUrlCount = existingUrls?.length || 0;
    const totalUrls = currentValidUrls.length + existingUrlCount;

    if (totalUrls >= urlLimit) {
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

      const validUrls = urls.filter(url => url.trim() !== '');
      
      if (urlLimit === 0) {
        throw new Error(t('url.no.plan'));
      }

      const { error: progressError } = await supabase
        .from('customer_checklist_progress')
        .update({ removal_urls: validUrls })
        .eq('customer_id', session.user.id);

      if (progressError) throw progressError;

      const urlRows = validUrls.map(url => ({
        customer_id: session.user.id,
        url,
        display_in_incoming: true
      }));

      const { error: urlsError } = await supabase
        .from('removal_urls')
        .insert(urlRows);

      if (urlsError) throw urlsError;
      
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

  const handleSkipStep = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('No user session');
      
      onComplete();
    } catch (error: any) {
      console.error('Error skipping step:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (urlLimit === 0) {
    return <UpgradePrompt onSkip={handleSkipStep} isLoading={isLoading} />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-sm text-[#000000A6] dark:text-[#FFFFFFA6] mb-4">
        {t('url.limit.message', { limit: urlLimit })}
      </div>
      
      {urls.map((url, index) => (
        <UrlInput
          key={index}
          url={url}
          index={index}
          showRemove={urls.length > 1}
          onChange={handleUrlChange}
          onRemove={removeUrlField}
        />
      ))}
      
      {urls.filter(url => url.trim() !== '').length < urlLimit && (
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
        disabled={isLoading || urls.every(url => url.trim() === '') || urls.filter(url => url.trim() !== '').length > urlLimit}
        className="w-full py-6"
      >
        {isLoading ? t('saving') : t('save.urls')}
      </Button>
    </form>
  );
};