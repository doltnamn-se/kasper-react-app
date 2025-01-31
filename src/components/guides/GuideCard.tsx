import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem } from "@/components/ui/accordion";
import { ChevronDown } from "lucide-react";
import { GuideStep } from "./GuideStep";
import { GuideHeader } from "./GuideHeader";
import { useGuideCompletion } from "@/hooks/useGuideCompletion";
import { useGuideUtils } from "@/utils/guideUtils";
import { Switch } from "@/components/ui/switch";

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
  isCompleted?: boolean;
}

export const GuideCard = ({ 
  guide, 
  accordionId, 
  isOpen,
  onAccordionChange,
  variant = 'default',
  isCompleted = false
}: GuideCardProps) => {
  const { t, language } = useLanguage();
  const { handleGuideComplete } = useGuideCompletion();
  const { getGuideId, shouldShowCopyButton } = useGuideUtils();
  const url = guide.steps[0].text.match(/https?:\/\/[^\s]+/)?.[0];

  const handleComplete = async () => {
    console.log('Toggle clicked, current completion status:', isCompleted);
    const guideId = getGuideId(guide.title);
    if (!guideId) return;
    await handleGuideComplete(guideId);
  };

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

  const toggleSwitch = (
    <div className="absolute top-4 right-4 flex items-center gap-2">
      <span className="text-sm text-[#4c4c49] dark:text-[#67676c]">
        {isCompleted 
          ? (language === 'sv' ? 'Klar' : 'Done')
          : (language === 'sv' ? 'Ej klar' : 'Not done')}
      </span>
      <Switch
        checked={isCompleted}
        onCheckedChange={handleComplete}
        className="data-[state=checked]:bg-[#c3caf5] data-[state=unchecked]:bg-gray-200"
      />
    </div>
  );

  if (variant === 'checklist') {
    return (
      <div className="bg-white dark:bg-[#1c1c1e] rounded-[4px] relative">
        {toggleSwitch}
        <GuideHeader 
          title={guide.title}
          url={url}
        />
        {stepsContent}
      </div>
    );
  }

  return (
    <Card className="bg-white dark:bg-[#1c1c1e] border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200 rounded-[4px] relative">
      {toggleSwitch}
      <Accordion 
        type="single" 
        collapsible
        value={isOpen ? accordionId : ""}
        onValueChange={onAccordionChange}
      >
        <AccordionItem value={accordionId} className="border-none">
          <GuideHeader 
            title={guide.title}
            url={url}
          />
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