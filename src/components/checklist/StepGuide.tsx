import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GuideCard } from "@/components/guides/GuideCard";
import { useLanguage } from "@/contexts/LanguageContext";

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

  if (!guide) return null;

  return (
    <div className="space-y-4">
      <Badge variant="outline" className="w-fit bg-black dark:bg-white text-white dark:text-black border-none font-medium">
        {t('step.number', { number: currentStep })}
      </Badge>
      <GuideCard
        guide={guide}
        variant="checklist"
      />
      <Button
        onClick={() => onGuideComplete(siteId)}
        disabled={isGuideCompleted}
        className="w-full xl:w-1/4 lg:w-1/2"
      >
        {isGuideCompleted ? 
          (language === 'sv' ? 'Klart' : 'Completed') : 
          (language === 'sv' ? 'Markera som klar' : 'Mark as completed')}
      </Button>
    </div>
  );
};