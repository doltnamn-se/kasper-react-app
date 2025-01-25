import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ArrowRight } from "lucide-react";
import { useState } from "react";

interface GuideStep {
  text: string;
}

interface Guide {
  title: string;
  steps: GuideStep[];
}

const guides: Guide[] = [
  {
    title: "Eniro.se",
    steps: [
      { text: "Länk: https://uppdatera.eniro.se/person" },
      { text: "Skriv in ditt namn i sökrutan" },
      { text: "Identifiera dig med Mobilt BankID" },
      { text: "Dölj dina uppgifter" }
    ]
  },
  {
    title: "Mrkoll.se",
    steps: [
      { text: "Länk: https://mrkoll.se/om/andra-uppgifter/" },
      { text: "Identifiera dig med Mobilt BankID" },
      { text: "Dölj din adress och ditt telefonnummer" }
    ]
  },
  {
    title: "Hitta.se",
    steps: [
      { text: "Länk: https://www.hitta.se/kontakta-oss/ta-bort-kontaktsida" },
      { text: "Skriv in ditt namn i sökrutan" },
      { text: "Identifiera dig med Mobilt BankID" }
    ]
  },
  {
    title: "Merinfo.se",
    steps: [
      { text: "Länk: https://www.merinfo.se/ta-bort-mina-uppgifter" },
      { text: "Identifiera dig med Mobilt BankID" }
    ]
  },
  {
    title: "Ratsit.se",
    steps: [
      { text: "Länk: https://www.ratsit.se/redigera/dolj" },
      { text: "Identifiera dig med Mobilt BankID." },
      { text: "Klicka på att dölja dina uppgifter." }
    ]
  },
  {
    title: "Birthday.se",
    steps: [
      { text: "Länk: https://www.birthday.se/kontakta" },
      { text: "Fyll i formuläret." },
      { text: "Skriv detta i meddelandefältet:\n\" Jag önskar att mina personuppgifter tas bort från Birthday.se och att min information döljs från de publika sökresultaten. Mitt personnummer är XXXXXX-XXXX. \"" }
    ]
  },
  {
    title: "Upplysning.se",
    steps: [
      { text: "Länk: https://www.upplysning.se/kontakta-oss" },
      { text: "Fyll i formuläret." },
      { text: "Skriv detta i meddelandefältet:\n\" Jag önskar att mina personuppgifter tas bort från Upplysning.se och att min information döljs från de publika sökresultaten. Mitt personnummer är XXXXXX-XXXX. \"" }
    ]
  }
];

const Guides = () => {
  const { t } = useLanguage();
  const [openAccordion, setOpenAccordion] = useState<string | undefined>(undefined);

  const extractUrl = (text: string) => {
    const match = text.match(/https?:\/\/[^\s]+/);
    return match ? match[0] : null;
  };

  const leftColumnGuides = guides.filter((_, index) => index % 2 === 0);
  const rightColumnGuides = guides.filter((_, index) => index % 2 === 1);

  const GuideColumn = ({ guides, columnIndex }: { guides: Guide[], columnIndex: number }) => (
    <div className="flex flex-col gap-4">
      {guides.map((guide, index) => {
        const accordionId = `${columnIndex}-${index}`;
        const isOpen = openAccordion === accordionId;
        
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
                      window.open(extractUrl(guide.steps[0].text), '_blank');
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
                        return (
                          <div 
                            key={stepIndex} 
                            className="flex items-start gap-4"
                          >
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#e0e0e0] dark:bg-[#3A3A3B] flex items-center justify-center">
                              <span className="text-xs font-medium">{stepIndex}</span>
                            </div>
                            <span 
                              className="text-sm leading-relaxed font-medium text-[#000000] dark:text-white"
                              style={{ whiteSpace: 'pre-line' }}
                            >
                              {step.text}
                            </span>
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