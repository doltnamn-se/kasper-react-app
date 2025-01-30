import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useGuideCompletion } from "@/hooks/useGuideCompletion";
import { useToast } from "@/hooks/use-toast";

interface GuideHeaderProps {
  title: string;
  url: string | undefined;
  onComplete: () => void;
}

export const GuideHeader = ({ title, url, onComplete }: GuideHeaderProps) => {
  const { t, language } = useLanguage();
  const { toast } = useToast();

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (url) window.open(url, '_blank');
  };

  const handleComplete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await onComplete();
      toast({
        title: language === 'sv' ? 'Guide slutförd' : 'Guide completed',
        description: language === 'sv' 
          ? 'Guiden har markerats som slutförd' 
          : 'The guide has been marked as completed',
      });
    } catch (error) {
      console.error('Error completing guide:', error);
      toast({
        title: language === 'sv' ? 'Ett fel uppstod' : 'An error occurred',
        description: language === 'sv' 
          ? 'Kunde inte markera guiden som slutförd' 
          : 'Could not mark the guide as completed',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="px-6 py-6">
      <h3 className="text-lg font-semibold text-[#000000] dark:text-white mb-4">{title}</h3>
      <div className="flex gap-2">
        <Button 
          className="bg-[#e0e0e0] hover:bg-[#d0d0d0] text-[#000000] dark:bg-[#2a2a2b] dark:hover:bg-[#3a3a3b] dark:text-[#FFFFFF] gap-2"
          onClick={handleButtonClick}
        >
          {t('link.to.removal')}
          <ArrowRight className="h-2 w-2 -rotate-45" />
        </Button>
        <Button
          variant="outline"
          className="gap-2"
          onClick={handleComplete}
        >
          <CheckCircle className="h-4 w-4" />
          {language === 'sv' ? 'Markera som slutförd' : 'Mark as completed'}
        </Button>
      </div>
    </div>
  );
};