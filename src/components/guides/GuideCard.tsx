import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem } from "@/components/ui/accordion";
import { ArrowRight, ChevronDown, CheckCircle } from "lucide-react";
import { GuideStep } from "./GuideStep";
import { useGuideCompletion } from "@/hooks/useGuideCompletion";
import { useToast } from "@/hooks/use-toast";

interface GuideStep {
  text: string;
}

interface GuideCardProps {
  guide: {
    title: string;
    steps: GuideStep[];
  };
  accordionId: string;
  isOpen: boolean;
  onAccordionChange: (value: string) => void;
  variant?: 'default' | 'checklist';
}

export const GuideCard = ({ 
  guide, 
  accordionId, 
  isOpen,
  onAccordionChange,
  variant = 'default' 
}: GuideCardProps) => {
  const { t, language } = useLanguage();
  const { handleGuideComplete } = useGuideCompletion();
  const { toast } = useToast();
  const url = guide.steps[0].text.match(/https?:\/\/[^\s]+/)?.[0];

  const shouldShowCopyButton = (guideTitle: string, stepText: string) => {
    const isBirthdayOrUpplysning = 
      guideTitle === t('guide.birthday.title') || 
      guideTitle === t('guide.upplysning.title');
    return isBirthdayOrUpplysning && stepText.includes('\"');
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (url) window.open(url, '_blank');
  };

  const getGuideId = (title: string): string => {
    const titleToId: { [key: string]: string } = {
      [t('guide.eniro.title')]: 'eniro',
      [t('guide.mrkoll.title')]: 'mrkoll',
      [t('guide.hitta.title')]: 'hitta',
      [t('guide.merinfo.title')]: 'merinfo',
      [t('guide.ratsit.title')]: 'ratsit',
      [t('guide.birthday.title')]: 'birthday',
      [t('guide.upplysning.title')]: 'upplysning'
    };
    return titleToId[title] || '';
  };

  const handleComplete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const guideId = getGuideId(guide.title);
    if (!guideId) return;

    try {
      await handleGuideComplete(guideId);
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

  const headerContent = (
    <div className="px-6 py-6">
      <h3 className="text-lg font-semibold text-[#000000] dark:text-white mb-4">{guide.title}</h3>
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

  const stepsContent = (
    <div className="space-y-4 px-6 pb-6">
      {guide.steps.map((step, stepIndex) => {
        if (stepIndex === 0) return null;
        
        return (
          <GuideStep
            key={stepIndex}
            stepIndex={stepIndex}
            text={step.text}
            showCopyButton={shouldShowCopyButton(guide.title, step.text)}
            guideTitle={guide.title}
          />
        );
      })}
    </div>
  );

  if (variant === 'checklist') {
    return (
      <div className="bg-white dark:bg-[#1c1c1e] rounded-[4px]">
        {headerContent}
        {stepsContent}
      </div>
    );
  }

  return (
    <Card className="bg-white dark:bg-[#1c1c1e] border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200 rounded-[4px]">
      <Accordion 
        type="single" 
        collapsible
        value={isOpen ? accordionId : ""}
        onValueChange={onAccordionChange}
      >
        <AccordionItem value={accordionId} className="border-none">
          {headerContent}
          <AccordionContent>
            {stepsContent}
          </AccordionContent>
          <div 
            className="px-6 py-4 border-t border-[#e5e7eb] dark:border-[#232325] flex justify-center items-center gap-2 cursor-pointer"
            onClick={() => onAccordionChange(accordionId)}
          >
            <span className="text-sm font-medium text-[#000000] dark:text-white">Guide</span>
            <ChevronDown 
              className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </div>
        </AccordionItem>
      </Accordion>
    </Card>
  );
};