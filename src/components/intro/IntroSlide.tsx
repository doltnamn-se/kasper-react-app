import { ReactNode } from "react";

interface IntroSlideProps {
  visual: ReactNode;
  headlineSwedishLine1: string;
  headlineSwedishLine2: string;
  headlineEnglishLine1: string;
  headlineEnglishLine2: string;
  language: string;
}

export const IntroSlide = ({ 
  visual, 
  headlineSwedishLine1, 
  headlineSwedishLine2, 
  headlineEnglishLine1, 
  headlineEnglishLine2, 
  language 
}: IntroSlideProps) => {
  const line1 = language === 'sv' ? headlineSwedishLine1 : headlineEnglishLine1;
  const line2 = language === 'sv' ? headlineSwedishLine2 : headlineEnglishLine2;
  
  return (
    <div className="flex flex-col items-center justify-center gap-8 px-6">
      {/* Two-line headline */}
      <h1 className="text-center leading-tight">
        {line1}
        <br />
        {line2}
      </h1>
      
      {/* Visual showcase */}
      <div className="w-full max-w-sm">
        {visual}
      </div>
    </div>
  );
};
