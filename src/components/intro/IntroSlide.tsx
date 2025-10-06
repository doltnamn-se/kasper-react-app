import { ReactNode } from "react";

interface IntroSlideProps {
  visual: ReactNode;
  headlineSwedish: string;
  headlineEnglish: string;
  language: string;
}

export const IntroSlide = ({ visual, headlineSwedish, headlineEnglish, language }: IntroSlideProps) => {
  const headline = language === 'sv' ? headlineSwedish : headlineEnglish;
  
  return (
    <div className="flex flex-col items-center justify-center gap-8 px-6">
      {/* Visual showcase */}
      <div className="w-full max-w-sm">
        {visual}
      </div>
      
      {/* Two-line headline */}
      <h1 className="text-center leading-tight whitespace-pre-line">
        {headline}
      </h1>
    </div>
  );
};
