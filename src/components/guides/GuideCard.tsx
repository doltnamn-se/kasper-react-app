import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { GuideStep } from "./GuideStep";

interface GuideStep {
  text: string;
}

interface GuideCardProps {
  guide: {
    title: string;
    steps: GuideStep[];
  };
  accordionId: string;
  openAccordion?: string;
  onAccordionChange: (value: string) => void;
}

export const GuideCard = ({ guide, accordionId, openAccordion, onAccordionChange }: GuideCardProps) => {
  const { t } = useLanguage();
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

  return (
    <Card className="bg-white dark:bg-[#1c1c1e] border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200 rounded-[4px]">
      <Accordion 
        type="single" 
        collapsible 
        value={openAccordion === accordionId ? accordionId : ""}
        onValueChange={(value) => onAccordionChange(value)}
        className="w-full"
      >
        <AccordionItem value={accordionId} className="border-none">
          <div className="px-6 py-6">
            <h3 className="text-lg font-semibold text-[#000000] dark:text-white mb-4">{guide.title}</h3>
            <Button 
              className="bg-[#e0e0e0] hover:bg-[#d0d0d0] text-[#000000] dark:bg-[#2a2a2b] dark:hover:bg-[#3a3a3b] dark:text-[#FFFFFF] gap-2"
              onClick={handleButtonClick}
            >
              {t('link.to.removal')}
              <ArrowRight className="h-2 w-2 -rotate-45" />
            </Button>
          </div>
          <AccordionContent>
            <div className="px-6 pb-6">
              <div className="space-y-4">
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
            </div>
          </AccordionContent>
          <AccordionTrigger className="px-6 py-4 border-t border-[#e5e7eb] dark:border-[#232325] justify-center">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[#000000] dark:text-white">Guide</span>
              <ChevronDown 
                className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                  openAccordion === accordionId ? 'rotate-180' : ''
                }`}
              />
            </div>
          </AccordionTrigger>
        </AccordionItem>
      </Accordion>
    </Card>
  );
};