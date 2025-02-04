import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

interface UpgradePromptProps {
  onSkip: () => void;
  isLoading: boolean;
  onComplete: () => void;
}

export const UpgradePrompt = ({ onSkip, isLoading, onComplete }: UpgradePromptProps) => {
  const { language } = useLanguage();
  
  const handleUpgrade = async (url: string) => {
    try {
      console.log('UpgradePrompt - Starting upgrade process');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('No user session');

      // Mark step as complete in checklist progress
      const { error: progressError } = await supabase
        .from('customer_checklist_progress')
        .update({ 
          removal_urls: ['skipped'],
          completed_at: new Date().toISOString()
        })
        .eq('customer_id', session.user.id);

      if (progressError) throw progressError;

      // Open upgrade URL in new tab
      window.open(url, '_blank');
      
      console.log('UpgradePrompt - Upgrade process complete, calling onComplete');
      onComplete();
    } catch (error) {
      console.error('Error in handleUpgrade:', error);
    }
  };

  const handleSkip = async () => {
    try {
      console.log('UpgradePrompt - Starting skip process');
      await onSkip();
      console.log('UpgradePrompt - Skip successful, calling onComplete');
      onComplete();
    } catch (error) {
      console.error('Error in handleSkip:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center p-4 bg-[#e54d2e1a] dark:bg-[#e54d2e1a] border border-[#f3b0a2] dark:border-[#7f2315] rounded-lg">
        <p className="text-sm text-[#ca3214] dark:text-[#f16a50]">
          {language === 'sv' 
            ? 'Det ingår inte avindexeringslänkar i vår månadsprenumeration' 
            : 'Deindexing links are not included in our monthly subscription'}
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Button
          variant="default"
          onClick={() => handleUpgrade('https://buy.stripe.com/4gw2976Ww5yh92wcMW')}
          className="w-full"
        >
          {language === 'sv' ? 'Uppgradera prenumeration' : 'Upgrade subscription'}
        </Button>
        <Button
          variant="default"
          onClick={() => handleUpgrade('https://buy.stripe.com/bIYfZXft26Cl92w3cn')}
          className="w-full"
        >
          {language === 'sv' ? 'Uppgradera prenumeration' : 'Upgrade subscription'}
        </Button>
        <Button
          variant="outline"
          onClick={handleSkip}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 
            (language === 'sv' ? 'Hoppar över...' : 'Skipping...') : 
            (language === 'sv' ? 'Hoppa över steg' : 'Skip this step')}
        </Button>
      </div>
    </div>
  );
};