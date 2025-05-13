
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Avatar } from "@/components/ui/avatar";
import { useGuideData } from "@/hooks/useGuideData";

interface GuideHeaderProps {
  title: string;
  url: string | undefined;
}

export const GuideHeader = ({ title, url }: GuideHeaderProps) => {
  const { t, language } = useLanguage();
  const { getGuideId } = useGuideData();
  
  const guideId = getGuideId(title);
  const logoSrc = `/lovable-uploads/logo-icon-${guideId}.webp`;

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (url) window.open(url, '_blank');
  };

  return (
    <div className="px-6 py-6">
      <div className="flex items-center gap-3 mb-4">
        <Avatar className="h-8 w-8">
          <img src={logoSrc} alt={`${title} logo`} className="object-cover" />
        </Avatar>
        <h3 className="text-lg font-semibold text-[#000000] dark:text-white">{title}</h3>
      </div>
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
