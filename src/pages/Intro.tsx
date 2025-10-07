import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { IntroCarousel } from "@/components/intro/IntroCarousel";

export default function Intro() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);

    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.attributeName === 'class') {
          const isDark = document.documentElement.classList.contains('dark');
          setIsDarkMode(isDark);
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  const handleSignIn = () => {
    navigate("/auth");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] dark:bg-[#1a1a1a] p-4 md:p-8">
      {/* Header */}
      <div 
        className="flex justify-between items-center mb-8"
        style={{
          paddingTop: 'max(env(safe-area-inset-top), 0px)'
        }}
      >
        {/* Logo */}
        <div className="relative h-6 w-auto min-w-[80px]">
          <img 
            src="/lovable-uploads/kasper-logo-app-dark.svg" 
            alt="Logo" 
            className={`h-6 w-auto absolute inset-0 transition-opacity duration-200 ${isDarkMode ? 'opacity-0' : 'opacity-100'}`}
          />
          <img 
            src="/lovable-uploads/kasper-logo-app-light.svg" 
            alt="Logo" 
            className={`h-6 w-auto absolute inset-0 transition-opacity duration-200 ${isDarkMode ? 'opacity-100' : 'opacity-0'}`}
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
      <div className="flex-1 flex flex-col items-center justify-center -mt-8">
        <IntroCarousel language={language} showIndicators={true} />
      </div>

      {/* Bottom button */}
      <div 
        className="pb-8"
        style={{
          paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))'
        }}
      >
        <Button 
          onClick={handleSignIn}
          className="w-full text-[1rem]"
          size="lg"
        >
          {language === 'sv' ? 'Logga in' : 'Sign in'}
        </Button>
      </div>
    </div>
  );
}
