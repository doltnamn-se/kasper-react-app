import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GuideCard } from "@/components/guides/GuideCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface StepGuideProps {
  currentStep: number;
  siteId: string;
  guide: any;
  isGuideCompleted: boolean;
  onGuideComplete: (siteId: string) => Promise<void>;
}

export const StepGuide = ({
  currentStep,
  siteId,
  guide,
  isGuideCompleted,
  onGuideComplete
}: StepGuideProps) => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [openAccordions, setOpenAccordions] = useState<Set<string>>(new Set());

  const handleAccordionChange = (accordionId: string) => {
    setOpenAccordions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(accordionId)) {
        newSet.delete(accordionId);
      } else {
        newSet.add(accordionId);
      }
      return newSet;
    });
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      await onGuideComplete(siteId);
      toast({
        title: t('success'),
        description: t('guide.completed'),
      });
    } catch (error) {
      console.error('Error completing guide:', error);
      toast({
        variant: "destructive",
        title: t('error'),
        description: t('guide.completion.error'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!guide) return null;

  const accordionId = `guide-${siteId}`;

  return (
    <div className="space-y-4">
      <Badge variant="outline" className="w-fit bg-black dark:bg-white text-white dark:text-black border-none font-medium">
        {t('step.number', { number: currentStep })}
      </Badge>
      <GuideCard
        guide={guide}
        variant="checklist"
        accordionId={accordionId}
        isOpen={openAccordions.has(accordionId)}
        onAccordionChange={handleAccordionChange}
      />
      <Button
        onClick={handleComplete}
        disabled={isGuideCompleted || isLoading}
        className="w-full xl:w-1/4 lg:w-1/2"
      >
        {isLoading ? t('saving') :
          isGuideCompleted ? 
            (language === 'sv' ? 'Klart' : 'Completed') : 
            (language === 'sv' ? 'Markera som klar' : 'Mark as completed')}
      </Button>
    </div>
  );
};