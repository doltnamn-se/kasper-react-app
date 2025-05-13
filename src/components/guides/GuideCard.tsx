
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem } from "@/components/ui/accordion";
import { GuideHeader } from "./GuideHeader";
import { GuideSteps } from "./GuideSteps";
import { GuideAccordionFooter } from "./GuideAccordionFooter";
import { useGuideUtils } from "@/utils/guideUtils";

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
  const { shouldShowCopyButton } = useGuideUtils();
  const url = guide.steps[0].text.match(/https?:\/\/[^\s]+/)?.[0];

  // Get first step after the URL step
  const firstStep = guide.steps.length > 1 ? guide.steps[1] : null;

  if (variant === 'checklist') {
    return (
      <div className="bg-white dark:bg-[#1c1c1e] rounded-[4px] relative">
        <GuideHeader title={guide.title} url={url} />
        <GuideSteps steps={guide.steps} guideTitle={guide.title} />
      </div>
    );
  }

  return (
    <Card className="bg-white dark:bg-[#1c1c1e] border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200 rounded-[4px] relative">
      <Accordion 
        type="single" 
        collapsible
        value={isOpen ? accordionId : ""}
        onValueChange={onAccordionChange}
      >
        <AccordionItem value={accordionId} className="border-none">
          <GuideHeader title={guide.title} url={url} />
          
          {/* Faded first step when accordion is closed */}
          {!isOpen && firstStep && (
            <div className="px-6 pb-3">
              <div className="flex items-center gap-4 opacity-50">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#e0e0e0] dark:bg-[#3A3A3B] flex items-center justify-center">
                  <span className="text-xs font-medium">1</span>
                </div>
                <span className="text-sm leading-relaxed font-medium text-[#000000] dark:text-white truncate">
                  {firstStep.text}
                </span>
              </div>
            </div>
          )}
          
          <AccordionContent>
            <GuideSteps steps={guide.steps} guideTitle={guide.title} />
          </AccordionContent>
          
          <GuideAccordionFooter 
            isOpen={isOpen} 
            onAccordionChange={() => onAccordionChange(accordionId)} 
          />
        </AccordionItem>
      </Accordion>
    </Card>
  );
};
