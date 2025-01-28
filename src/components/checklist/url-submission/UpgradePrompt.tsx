import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface UpgradePromptProps {
  onSkip: () => Promise<void>;
  isLoading: boolean;
}

export const UpgradePrompt = ({ onSkip, isLoading }: UpgradePromptProps) => {
  const { t, language } = useLanguage();
  
  return (
    <div className="space-y-4">
      <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          {t('url.no.plan')}
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Button
          variant="default"
          onClick={() => window.open('https://buy.stripe.com/dR67tr1Cc8KtguY147', '_blank')}
          className="w-full"
        >
          {language === 'sv' ? 'Uppgradera till 6 mån' : 'Upgrade to 6 mo'}
        </Button>
        <Button
          variant="default"
          onClick={() => window.open('https://buy.stripe.com/3cs5lj2Gg3q9diMeUY', '_blank')}
          className="w-full"
        >
          {language === 'sv' ? 'Uppgradera till 12 mån' : 'Upgrade to 12 mo'}
        </Button>
        <Button
          variant="outline"
          onClick={onSkip}
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