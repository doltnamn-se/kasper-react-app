import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

  const extractUrl = (text: string) => {
    const match = text.match(/https?:\/\/[^\s]+/);
    return match ? match[0] : null;
  };

  return (
    <MainLayout>
      <h1 className="text-2xl font-black tracking-[-.416px] text-[#000000] dark:text-white mb-6">
        {t('nav.guides')}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {guides.map((guide, index) => (
          <Card key={index} className="bg-white dark:bg-[#1c1c1e] border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200 rounded-lg">
            <Accordion type="single" collapsible>
              <AccordionItem value={`guide-${index}`} className="border-none">
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <div className="flex flex-col items-start text-left">
                    <h3 className="text-lg font-semibold mb-2 text-[#000000] dark:text-white">{guide.title}</h3>
                    <p className="text-sm text-[#000000A6] dark:text-[#FFFFFFA6] line-clamp-2 opacity-70">
                      {guide.steps[0].text.replace(/Länk: /, '')}
                    </p>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4">
                  <ol className="list-decimal list-inside space-y-2">
                    {guide.steps.map((step, stepIndex) => {
                      const url = extractUrl(step.text);
                      if (stepIndex === 0 && url) {
                        return (
                          <li key={stepIndex} className="text-sm leading-relaxed text-[#000000] dark:text-white">
                            <Button 
                              className="h-12 w-full lg:w-1/2"
                              onClick={() => window.open(url, '_blank')}
                            >
                              {t('update.password')}
                            </Button>
                          </li>
                        );
                      }
                      return (
                        <li 
                          key={stepIndex} 
                          className="text-sm leading-relaxed text-[#000000] dark:text-white"
                          style={{ whiteSpace: 'pre-line' }}
                        >
                          {step.text.replace(/Länk: .*/, '')}
                        </li>
                      );
                    })}
                  </ol>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>
        ))}
      </div>
    </MainLayout>
  );
};

export default Guides;