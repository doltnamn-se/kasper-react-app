import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface UpgradePromptProps {
  onSkip: () => void;
  isLoading: boolean;
  onComplete: () => void;
}

export const UpgradePrompt = ({ onSkip, isLoading, onComplete }: UpgradePromptProps) => {
  const { language } = useLanguage();
  
  const handleUpgrade = async (url: string) => {
    // Open upgrade URL in new tab
    window.open(url, '_blank');
    // Complete the step
    await onComplete();
  };

  const handleSkip = async () => {
    // Skip and mark as complete
    await onSkip();
    await onComplete();
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
          {language === 'sv' ? 'Byt till 6 månader (2 länkar)' : 'Change to 6 months (2 links)'}
        </Button>
        <Button
          variant="default"
          onClick={() => handleUpgrade('https://buy.stripe.com/bIYfZXft26Cl92w3cn')}
          className="w-full"
        >
          {language === 'sv' ? 'Byt till 12 månader (4 länkar)' : 'Change to 12 months (4 links)'}
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