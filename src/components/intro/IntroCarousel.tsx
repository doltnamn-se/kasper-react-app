import { useState, useRef, useEffect } from "react";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { IntroSlide } from "@/components/intro/IntroSlide";
import { ScoreVisual } from "@/components/intro/ScoreVisual";
import { StatusVisual } from "@/components/intro/StatusVisual";
import { MonitoringVisual } from "@/components/intro/MonitoringVisual";
import { AddressAlertsVisual } from "@/components/intro/AddressAlertsVisual";
import Autoplay from "embla-carousel-autoplay";

interface IntroCarouselProps {
  language: string;
  showIndicators?: boolean;
  bgColorLight?: string;
  bgColorDark?: string;
}

export const IntroCarousel = ({ language, showIndicators = true, bgColorLight = '#fafafa', bgColorDark = '#1a1a1a' }: IntroCarouselProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const autoplayRef = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <div className="flex flex-col items-center justify-center gap-12">
      <Carousel 
        setApi={setApi} 
        className="w-full max-w-md"
        plugins={[autoplayRef.current]}
        onMouseEnter={() => autoplayRef.current.stop()}
        onMouseLeave={() => autoplayRef.current.play()}
      >
        <CarouselContent>
          <CarouselItem>
            <IntroSlide
              visual={<StatusVisual language={language} bgColorLight={bgColorLight} bgColorDark={bgColorDark} />}
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
      {showIndicators && (
        <div className="flex items-center justify-center gap-2">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={`h-1 rounded-full transition-all duration-300 overflow-hidden relative ${
                current === index 
                  ? 'w-8 bg-[#000000]/30 dark:bg-[#ffffff]/30' 
                  : 'w-1 bg-[#000000]/30 dark:bg-[#ffffff]/30'
              }`}
            >
              {current === index && (
                <div 
                  key={`progress-${current}-${index}`}
                  className="absolute inset-0 bg-[#000000] dark:bg-[#ffffff] origin-left animate-[progress_5s_linear_forwards]"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
