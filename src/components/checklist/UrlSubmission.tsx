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
  const { t } = useLanguage();
  const { toast } = useToast();
  const {
    urls,
    setUrls,
    isLoading,
    setIsLoading,
    existingUrls,
    getUrlLimit
  } = useUrlSubmission();

  const urlLimit = getUrlLimit();
  const existingUrlCount = existingUrls?.length || 0;
  const remainingUrls = Math.max(0, urlLimit - existingUrlCount);
  const currentValidUrls = urls.filter(url => url.trim() !== '');

  const handleUrlChange = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  const addUrlField = () => {
    if (urls.length >= remainingUrls) {
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

      if (validUrls.length + existingUrlCount > urlLimit) {
        throw new Error(t('url.limit.message', { limit: urlLimit }));
      }

      // Update checklist progress with URLs or ['skipped'] if no URLs provided
      const { error: progressError } = await supabase
        .from('customer_checklist_progress')
        .update({ 
          removal_urls: validUrls.length > 0 ? validUrls : ['skipped'],
          completed_at: new Date().toISOString()
        })
        .eq('customer_id', session.user.id);

      if (progressError) throw progressError;

      // Only insert URLs if there are valid ones
      if (validUrls.length > 0) {
        const urlRows = validUrls.map(url => ({
          customer_id: session.user.id,
          url,
          display_in_incoming: true
        }));

        const { error: urlsError } = await supabase
          .from('removal_urls')
          .insert(urlRows);

        if (urlsError) throw urlsError;
      }
      
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
      <UpgradePrompt 
        onSkip={async () => {
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return;

            const { error: progressError } = await supabase
              .from('customer_checklist_progress')
              .update({ removal_urls: ['skipped'] })
              .eq('customer_id', session.user.id);

            if (progressError) throw progressError;
            
            onComplete();
          } catch (error) {
            console.error('Error skipping URL submission:', error);
          }
        }} 
        isLoading={isLoading} 
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-sm text-[#000000A6] dark:text-[#FFFFFFA6] mb-4">
        {t('url.limit.message', { limit: urlLimit })}
        {existingUrlCount > 0 && (
          <div className="mt-2">
            {t('url.remaining.message', { count: remainingUrls })}
          </div>
        )}
      </div>
      
      {urls.map((url, index) => (
        <UrlInput
          key={index}
          url={url}
          index={index}
          showRemove={urls.length > 1}
          onChange={handleUrlChange}
          onRemove={removeUrlField}
          required={false}
        />
      ))}
      
      {urls.length < remainingUrls && (
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
        disabled={isLoading}
        className="w-full py-6"
      >
        {isLoading ? t('saving') : (currentValidUrls.length > 0 ? t('save.urls') : t('step.2.skip'))}
      </Button>
    </form>
  );
};