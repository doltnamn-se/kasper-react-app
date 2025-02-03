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
    <div className="flex flex-wrap items-center gap-8">
    </div>
  );
};