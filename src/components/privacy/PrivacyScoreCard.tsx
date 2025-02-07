
import { useLanguage } from "@/contexts/LanguageContext";
import { usePrivacyScore } from "@/hooks/usePrivacyScore";
import { Progress } from "@/components/ui/progress";
import { MousePointerClick, MapPinHouse, EyeOff, UserSearch } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

export const PrivacyScoreCard = () => {
  const { calculateScore } = usePrivacyScore();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const score = calculateScore();

  const getColorClass = (value: number) => {
    if (value >= 80) return "text-green-500 dark:text-green-400";
    if (value >= 50) return "text-yellow-500 dark:text-yellow-400";
    return "text-red-500 dark:text-red-400";
  };

  const getProgressClass = (value: number) => {
    if (value >= 80) return "bg-green-500 dark:bg-green-400";
    if (value >= 50) return "bg-yellow-500 dark:bg-yellow-400";
    return "bg-red-500 dark:bg-red-400";
  };

  const getProtectionLevel = (score: number) => {
    if (score === 100) return language === 'sv' ? "Fullt skyddad" : "Fully protected";
    if (score >= 90) return language === 'sv' ? "Säkert skydd" : "Safe protection";
    if (score >= 75) return language === 'sv' ? "Bra skydd" : "Good protection";
    if (score >= 50) return language === 'sv' ? "Hyfsat skydd" : "Decent protection";
    if (score >= 25) return language === 'sv' ? "Dåligt skydd" : "Poor protection";
    return language === 'sv' ? "Inget skydd" : "No protection";
  };

  const ScoreItem = ({ 
    icon: Icon, 
    title, 
    score, 
    onClick 
  }: { 
    icon: any; 
    title: string; 
    score: number;
    onClick: () => void;
  }) => (
    <div 
      className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <Icon className={cn("w-5 h-5", getColorClass(score))} />
      <div className="flex-1">
        <div className="text-sm font-medium">{title}</div>
        <Progress value={score} className="h-2 mt-1">
          <div className={cn("h-full transition-all", getProgressClass(score))} style={{ width: `${score}%` }} />
        </Progress>
      </div>
      <span className={cn("text-sm font-semibold", getColorClass(score))}>
        {score}%
      </span>
    </div>
  );

  return (
    <div className="bg-white dark:bg-[#1c1c1e] p-4 md:p-6 rounded-[4px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
      <div className="space-y-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold">
            {language === 'sv' ? 'Hur skyddad är du?' : 'How protected are you?'}
          </h2>
          <p className="text-[#000000A6] dark:text-[#FFFFFFA6] font-medium text-sm mb-10">
            {language === 'sv' ? 'Din aktuella skyddsnivå' : 'Your current protection level'}
          </p>
        </div>
        <div className="space-y-0">
          <span className={cn("text-6xl font-medium text-[#000000] dark:text-[#FFFFFF]")}>
            {score.total}
          </span>
          <p className="text-[#000000A6] dark:text-[#FFFFFFA6] text-sm font-medium" style={{ marginBottom: '30px' }}>
            {getProtectionLevel(score.total)}
          </p>
          <div className="flex-1">
            <Progress value={score.total} className="h-3">
              <div 
                className="h-full transition-all" 
                style={{ 
                  width: `${score.total}%`,
                  background: 'linear-gradient(90deg, #ea384c 0%, #F97316 25%, #FEF7CD 50%, #0EA5E9 75%, #10B981 100%)'
                }} 
              />
            </Progress>
            <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
              <span>0</span>
              <span>100</span>
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      <div className="space-y-2">
        <ScoreItem
          icon={UserSearch}
          title={language === 'sv' ? 'Bevakning' : 'Monitoring'}
          score={score.individual.monitoring}
          onClick={() => navigate('/monitoring')}
        />
        <ScoreItem
          icon={EyeOff}
          title={language === 'sv' ? 'Avindexering' : 'Deindexing'}
          score={score.individual.urls}
          onClick={() => navigate('/deindexing')}
        />
        <ScoreItem
          icon={MapPinHouse}
          title={language === 'sv' ? 'Adresslarm' : 'Address Alerts'}
          score={score.individual.address}
          onClick={() => navigate('/address-alerts')}
        />
        <ScoreItem
          icon={MousePointerClick}
          title={language === 'sv' ? 'Guider' : 'Guides'}
          score={score.individual.guides}
          onClick={() => navigate('/guides')}
        />
      </div>
    </div>
  );
};

