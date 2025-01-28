import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";

interface StepProgressProps {
  progress: number;
}

export const StepProgress = ({ progress }: StepProgressProps) => {
  const { t, language } = useLanguage();
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-wrap items-center gap-8 mb-6">
      <div className="w-full h-2 bg-[#e0e0e0] dark:bg-[#3a3a3b] rounded-full overflow-hidden">
        <div 
          className="h-full bg-[#4d985e] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};