import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ArrowRight, Copy } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface GuideStep {
  text: string;
}

interface Guide {
  title: string;
  steps: GuideStep[];
}

const Guides = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [openAccordion, setOpenAccordion] = useState<string | undefined>(undefined);

  const guides: Guide[] = [
    {
      title: t('guide.eniro.title'),
      steps: [
        { text: t('guide.eniro.step1') },
        { text: t('guide.eniro.step2') },
        { text: t('guide.eniro.step3') },
        { text: t('guide.eniro.step4') }
      ]
    },
    {
      title: t('guide.mrkoll.title'),
      steps: [
        { text: t('guide.mrkoll.step1') },
        { text: t('guide.mrkoll.step2') },
        { text: t('guide.mrkoll.step3') }
      ]
    },
    {
      title: t('guide.hitta.title'),
      steps: [
        { text: t('guide.hitta.step1') },
        { text: t('guide.hitta.step2') },
        { text: t('guide.hitta.step3') }
      ]
    },
    {
      title: t('guide.merinfo.title'),
      steps: [
        { text: t('guide.merinfo.step1') },
        { text: t('guide.merinfo.step2') }
      ]
    },
    {
      title: t('guide.ratsit.title'),
      steps: [
        { text: t('guide.ratsit.step1') },
        { text: t('guide.ratsit.step2') },
        { text: t('guide.ratsit.step3') }
      ]
    },
    {
      title: t('guide.birthday.title'),
      steps: [
        { text: t('guide.birthday.step1') },
        { text: t('guide.birthday.step2') },
        { text: t('guide.birthday.step3') }
      ]
    },
    {
      title: t('guide.upplysning.title'),
      steps: [
        { text: t('guide.upplysning.step1') },
        { text: t('guide.upplysning.step2') },
        { text: t('guide.upplysning.step3') }
      ]
    }
  ];

  const extractUrl = (text: string) => {
    const match = text.match(/https?:\/\/[^\s]+/);
    return match ? match[0] : null;
  };

  const extractMessageTemplate = (text: string) => {
    const match = text.match(/\"([^"]+)\"/);
    return match ? match[1].trim() : null;
  };

  const handleCopyMessage = async (text: string) => {
    const messageTemplate = extractMessageTemplate(text);
    if (messageTemplate) {
      await navigator.clipboard.writeText(messageTemplate);
      toast({
        title: "Kopierat",
        description: "Meddelandet har kopierats till urklipp",
        duration: 5000,
      });
    }
  };

  const leftColumnGuides = guides.filter((_, index) => index % 2 === 0);
  const rightColumnGuides = guides.filter((_, index) => index % 2 === 1);

  const GuideColumn = ({ guides, columnIndex }: { guides: Guide[], columnIndex: number }) => (
    <div className="flex flex-col gap-4">
      {guides.map((guide, index) => {
        const accordionId = `${columnIndex}-${index}`;
        const isOpen = openAccordion === accordionId;
        const url = extractUrl(guide.steps[0].text);
        
        return (
          <Card key={index} className="bg-white dark:bg-[#1c1c1e] border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200 rounded-[4px]">
            <Accordion 
              type="single" 
              collapsible 
              value={openAccordion === accordionId ? accordionId : undefined}
              onValueChange={(value) => setOpenAccordion(value)}
              className="w-full"
            >
              <AccordionItem value={accordionId} className="border-none">
                <div className="px-6 py-6">
                  <h3 className="text-lg font-semibold text-[#000000] dark:text-white mb-4">{guide.title}</h3>
                  <Button 
                    className="bg-[#e0e0e0] hover:bg-[#d0d0d0] text-[#000000] dark:bg-[#2a2a2b] dark:hover:bg-[#3a3a3b] dark:text-[#FFFFFF] gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (url) window.open(url, '_blank');
                    }}
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
                        const hasMessageTemplate = step.text.includes('meddelandefältet');
                        
                        return (
                          <div 
                            key={stepIndex} 
                            className="flex items-start gap-4"
                          >
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#e0e0e0] dark:bg-[#3A3A3B] flex items-center justify-center">
                              <span className="text-xs font-medium">{stepIndex}</span>
                            </div>
                            <div className="flex-grow flex items-start gap-2">
                              <span 
                                className="text-sm leading-relaxed font-medium text-[#000000] dark:text-white"
                                style={{ whiteSpace: 'pre-line' }}
                              >
                                {step.text}
                              </span>
                              {hasMessageTemplate && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="flex-shrink-0 h-6 w-6 mt-1"
                                  onClick={() => handleCopyMessage(step.text)}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
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
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </AccordionTrigger>
              </AccordionItem>
            </Accordion>
          </Card>
        );
      })}
    </div>
  );

  return (
    <MainLayout>
      <h1 className="text-2xl font-black tracking-[-.416px] text-[#000000] dark:text-white mb-6">
        {t('nav.guides')}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GuideColumn guides={leftColumnGuides} columnIndex={0} />
        <GuideColumn guides={rightColumnGuides} columnIndex={1} />
      </div>
    </MainLayout>
  );
};

export default Guides;
