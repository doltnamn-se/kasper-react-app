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
      {/* Carousel slides */}
      <div className="flex-1 flex items-center justify-center">
        <Carousel className="w-full max-w-md">
          <CarouselContent>
            <CarouselItem>
              <IntroSlide
                visual={<ScoreVisual />}
                headlineSwedish="Ta bort dig från\nupplysningssidor"
                headlineEnglish="Remove yourself\nfrom Search Sites"
                language={language}
              />
            </CarouselItem>
          </CarouselContent>
        </Carousel>
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
