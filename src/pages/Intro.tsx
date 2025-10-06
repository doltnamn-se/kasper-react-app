import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { isIOS } from "@/capacitor";
import { useLanguage } from "@/contexts/LanguageContext";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { IntroSlide } from "@/components/intro/IntroSlide";
import { ScoreVisual } from "@/components/intro/ScoreVisual";

export default function Intro() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const handleSignIn = () => {
    navigate("/auth");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] dark:bg-[#1a1a1a] p-4 md:p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 px-6">
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
      <div className="flex-1 flex items-center justify-center">
        <Carousel className="w-full max-w-md">
          <CarouselContent>
            <CarouselItem>
              <IntroSlide
                visual={<ScoreVisual />}
                headlineSwedishLine1="Ta bort dig från"
                headlineSwedishLine2="upplysningssidor"
                headlineEnglishLine1="Remove yourself"
                headlineEnglishLine2="from Search Sites"
                language={language}
              />
            </CarouselItem>
          </CarouselContent>
        </Carousel>
      </div>

      {/* Bottom button */}
      <div className="pb-8 px-6">
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
