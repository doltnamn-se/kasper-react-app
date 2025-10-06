import { ReactNode } from "react";

interface IntroSlideProps {
  visual: ReactNode;
  headlineSwedish: string;
  headlineEnglish: string;
  language: string;
}

export const IntroSlide = ({ visual, headlineSwedish, headlineEnglish, language }: IntroSlideProps) => {
  const headline = language === 'sv' ? headlineSwedish : headlineEnglish;
  const lines = headline.split('\n');
  
  return (
    <div className="flex flex-col items-center justify-center gap-8 px-6">
      {/* Visual showcase */}
      <div className="w-full max-w-sm">
        {visual}
      </div>
      
      {/* Two-line headline */}
      <h1 className="text-center leading-tight">
        {lines.map((line, index) => (
          <span key={index}>
            {line}
            {index < lines.length - 1 && <br />}
          </span>
        ))}
      </h1>
    </div>
  );
};
