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

  useEffect(() => {
    // If not iOS, redirect to auth
    if (!isIOS()) {
      navigate("/auth", { replace: true });
    }
  }, [navigate]);

  const handleSignIn = () => {
    // Mark that user has seen the intro
    localStorage.setItem("hasSeenIntro", "true");
    navigate("/auth");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Carousel slides */}
      <div className="flex-1 flex items-center justify-center py-12">
        <Carousel className="w-full max-w-md">
          <CarouselContent>
            <CarouselItem>
              <IntroSlide
                visual={<ScoreVisual />}
                headlineSwedish="Ta bort dig från\nupplysningssidor"
                headlineEnglish="Remove yourself\nfrom Search sites"
                language={language}
              />
            </CarouselItem>
          </CarouselContent>
        </Carousel>
      </div>

      {/* Bottom button */}
      <div className="p-6 pb-8">
        <Button 
          onClick={handleSignIn}
          className="w-full"
          size="lg"
        >
          Sign In
        </Button>
      </div>
    </div>
  );
}
