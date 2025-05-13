
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
          
          {/* First step always shown, opacity changes based on isOpen */}
          {firstStep && (
            <div className="px-6 pb-3 relative">
              <div className={`flex items-center gap-4 transition-opacity duration-200 ${
                isOpen ? 'opacity-100' : 'opacity-50'
              }`}>
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#e0e0e0] dark:bg-[#3A3A3B] flex items-center justify-center">
                  <span className="text-xs font-medium">1</span>
                </div>
                <span className="text-sm leading-relaxed font-medium text-[#000000] dark:text-white truncate">
                  {firstStep.text}
                </span>
              </div>
              
              {/* Overlay toggle button for closed state */}
              {!isOpen && (
                <div 
                  className="absolute bottom-0 left-0 right-0 flex justify-center items-center py-2 cursor-pointer"
                  onClick={() => onAccordionChange(accordionId)}
                >
                  <GuideAccordionFooter 
                    isOpen={isOpen} 
                    onAccordionChange={() => onAccordionChange(accordionId)} 
                  />
                </div>
              )}
            </div>
          )}
          
          <AccordionContent>
            {/* Show all steps except the first one (which is always visible) */}
            <div className="space-y-4 px-6 pb-6">
              {guide.steps.slice(2).map((step, index) => (
                <div key={index + 2} className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#e0e0e0] dark:bg-[#3A3A3B] flex items-center justify-center">
                    <span className="text-xs font-medium">{index + 2}</span>
                  </div>
                  <div className="flex-grow flex items-center gap-2">
                    <span 
                      className="text-sm leading-relaxed font-medium text-[#000000] dark:text-white"
                      style={{ whiteSpace: 'pre-line' }}
                    >
                      {step.text}
                    </span>
                    {shouldShowCopyButton(guide.title, step.text) && (
                      <button
                        onClick={() => navigator.clipboard.writeText(step.text.match(/\"([^"]+)\"/)?.at(1)?.trim() || '')}
                        className="flex-shrink-0 h-6 w-6 flex items-center justify-center transition-colors duration-200 text-[#000000A6] hover:text-[#000000] dark:text-[#FFFFFFA6] dark:hover:text-[#FFFFFF]"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M13.3332 6H7.99984C6.89527 6 5.99984 6.89543 5.99984 8V13.3333C5.99984 14.4379 6.89527 15.3333 7.99984 15.3333H13.3332C14.4377 15.3333 15.3332 14.4379 15.3332 13.3333V8C15.3332 6.89543 14.4377 6 13.3332 6Z" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M3.33317 10H2.6665C1.56193 10 0.666504 9.10457 0.666504 8V2.66667C0.666504 1.56209 1.56193 0.666656 2.6665 0.666656H7.99984C9.10441 0.666656 9.99984 1.56209 9.99984 2.66667V3.33332" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Footer toggle button for open state */}
            {isOpen && (
              <GuideAccordionFooter 
                isOpen={isOpen} 
                onAccordionChange={() => onAccordionChange(accordionId)} 
              />
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
};
