
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface GuideHeaderProps {
  title: string;
  url: string | undefined;
}

export const GuideHeader = ({ title, url }: GuideHeaderProps) => {
  const { t, language } = useLanguage();

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (url) window.open(url, '_blank');
  };

  return (
    <div className="px-6 py-6">
      <h3 className="text-lg font-semibold text-[#000000] dark:text-white mb-4">{title}</h3>
      <Button 
        className="bg-[#e0e0e0] hover:bg-[#d0d0d0] text-[#000000] dark:bg-[#2a2a2b] dark:hover:bg-[#3a3a3b] dark:text-[#FFFFFF] gap-2"
        onClick={handleButtonClick}
      >
        {t('link.to.removal')}
        <ArrowRight className="h-2 w-2 -rotate-45" />
      </Button>
    </div>
  );
};
