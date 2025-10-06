import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { isIOS } from "@/capacitor";
import { useLanguage } from "@/contexts/LanguageContext";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { IntroSlide } from "@/components/intro/IntroSlide";
import { ScoreVisual } from "@/components/intro/ScoreVisual";
import { StatusVisual } from "@/components/intro/StatusVisual";
import { MonitoringVisual } from "@/components/intro/MonitoringVisual";
import { AddressAlertsVisual } from "@/components/intro/AddressAlertsVisual";

export default function Intro() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const handleSignIn = () => {
    navigate("/auth");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] dark:bg-[#1a1a1a] p-4 md:p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        {/* Logo */}
        <div className="relative h-6 w-auto min-w-[80px]">
          <img 
            src="/lovable-uploads/kasper-logo-app-dark.svg" 
            alt="Logo" 
            className="h-6 w-auto absolute inset-0 transition-opacity duration-200 dark:opacity-0 opacity-100"
          />
          <img 
            src="/lovable-uploads/kasper-logo-app-light.svg" 
            alt="Logo" 
            className="h-6 w-auto absolute inset-0 transition-opacity duration-200 dark:opacity-100 opacity-0"
          />
        </div>
        
        {/* Small Login Button */}
        <Button 
          onClick={handleSignIn}
          variant="ghost"
          size="sm"
        >
          {language === 'sv' ? 'Logga in' : 'Sign in'}
        </Button>
      </div>

      {/* Carousel slides */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <Carousel setApi={setApi} className="w-full max-w-md">
          <CarouselContent>
            <CarouselItem>
              <IntroSlide
                visual={<StatusVisual language={language} />}
                headlineSwedishLine1="Ta bort dig från"
                headlineSwedishLine2="upplysningssidor"
                headlineEnglishLine1="Remove yourself"
                headlineEnglishLine2="from Search Sites"
                language={language}
              />
            </CarouselItem>
            <CarouselItem>
              <IntroSlide
                visual={<ScoreVisual language={language} isActive={current === 1} />}
                headlineSwedishLine1="Ta bort dina personliga"
                headlineSwedishLine2="uppgifter online"
                headlineEnglishLine1="Remove your personal"
                headlineEnglishLine2="information online"
                language={language}
              />
            </CarouselItem>
            <CarouselItem>
              <IntroSlide
                visual={<MonitoringVisual language={language} />}
                headlineSwedishLine1="Vår bevakningstjänst"
                headlineSwedishLine2="noterar dig om nya länkar"
                headlineEnglishLine1="Our monitoring service"
                headlineEnglishLine2="notifies you of new links"
                language={language}
              />
            </CarouselItem>
            <CarouselItem>
              <IntroSlide
                visual={<AddressAlertsVisual language={language} />}
                headlineSwedishLine1="Adresslarm"
                headlineSwedishLine2="för din trygghet"
                headlineEnglishLine1="Address alarm"
                headlineEnglishLine2="for your safety"
                language={language}
              />
            </CarouselItem>
          </CarouselContent>
        </Carousel>
        
        {/* Carousel indicators */}
        <div className="flex items-center justify-center gap-2">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={`h-1 rounded-full transition-all duration-300 ${
                current === index 
                  ? 'w-8 bg-[#000000] dark:bg-[#ffffff]' 
                  : 'w-1 bg-[#000000]/30 dark:bg-[#ffffff]/30'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Bottom button */}
      <div className="pb-8">
        <Button 
          onClick={handleSignIn}
          className="w-full"
          size="lg"
        >
          {language === 'sv' ? 'Logga in' : 'Sign in'}
        </Button>
      </div>
    </div>
  );
}
