
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem } from "@/components/ui/accordion";
import { GuideHeader } from "./GuideHeader";
import { GuideSteps } from "./GuideSteps";
import { GuideAccordionFooter } from "./GuideAccordionFooter";

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
  const url = guide.steps[0].text.match(/https?:\/\/[^\s]+/)?.[0];

  if (variant === 'checklist') {
    return (
      <div className="bg-white dark:bg-[#1c1c1e] rounded-[4px] relative">
        {/* GuideToggle removed */}
        <GuideHeader title={guide.title} url={url} />
        <GuideSteps steps={guide.steps} guideTitle={guide.title} />
      </div>
    );
  }

  return (
    <Card className="bg-white dark:bg-[#1c1c1e] border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200 rounded-[4px] relative">
      {/* GuideToggle removed */}
      <Accordion 
        type="single" 
        collapsible
        value={isOpen ? accordionId : ""}
        onValueChange={onAccordionChange}
      >
        <AccordionItem value={accordionId} className="border-none">
          <GuideHeader title={guide.title} url={url} />
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
