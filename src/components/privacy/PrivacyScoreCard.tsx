
import { useLanguage } from "@/contexts/LanguageContext";
import { usePrivacyScore } from "@/hooks/usePrivacyScore";
import { Progress } from "@/components/ui/progress";
import { MousePointerClick, MapPinHouse, EyeOff, UserSearch, Loader } from "lucide-react";
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
    score
  }: { 
    icon: any; 
    title: string; 
    score: number;
  }) => {
    return (
      <div className="space-y-2 p-3 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon className={cn("w-5 h-5 text-[#000000] dark:text-[#FFFFFF]")} />
            <div className="text-sm font-medium">{title}</div>
          </div>
          <span className={cn("text-sm font-semibold text-[#000000] dark:text-[#FFFFFF]")}>
            {score}%
          </span>
        </div>
        <div className="flex items-center justify-around">
          <div 
            className="relative w-6 h-6"
            style={{
              opacity: score / 100
            }}
          >
            <Loader 
              className={cn("[&>*]:animate-none stroke-[3]")}
              style={{
                width: '1.5rem',
                height: '1.5rem',
                stroke: 'url(#loaderGradient)',
                transform: 'rotate(90deg)',
              }}
            />
            <svg width="0" height="0">
              <defs>
                <linearGradient id="loaderGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: 'rgb(234, 56, 76)' }} />
                  <stop offset="35%" style={{ stopColor: 'rgb(249, 115, 22)' }} />
                  <stop offset="70%" style={{ stopColor: 'rgb(251, 209, 4)' }} />
                  <stop offset="88%" style={{ stopColor: 'rgb(17, 84, 242)' }} />
                  <stop offset="100%" style={{ stopColor: 'rgb(25, 208, 91)' }} />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    );
  };

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
          <p className="text-[#000000A6] dark:text-[#FFFFFFA6] text-sm font-medium" style={{ marginBottom: '50px', marginTop: '5px' }}>
            {getProtectionLevel(score.total)}
          </p>
          <div className="flex-1">
            <div className="relative mb-2">
              <div 
                style={{ 
                  left: `${score.total}%`,
                  transform: 'translateX(-50%)',
                  clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
                  width: '3.5px',
                  height: '2.5rem',
                  borderRadius: '5px',
                  position: 'absolute',
                  bottom: '5px',
                }}
                className="dark:bg-gradient-to-b dark:from-transparent dark:via-white/20 dark:to-white bg-gradient-to-b from-transparent via-black/20 to-black"
              />
            </div>
            <div className="relative w-full h-3 rounded-lg overflow-hidden">
              <div className="absolute inset-0 bg-[#e8e8e5] dark:bg-[#2f2e31]" />
              <div 
                className="absolute top-0 left-0 h-full transition-all rounded-r-lg"
                style={{ 
                  width: `${score.total}%`,
                  background: `linear-gradient(90deg, 
                    rgba(234, 56, 76, 1) 0%,
                    rgb(249, 115, 22) 35%,
                    rgba(251, 209, 4, 255) 70%,
                    rgba(17, 84, 242, 255) 88%,
                    rgba(25, 208, 91, 255) 100%
                  )`,
                  backgroundSize: `${100 / (score.total / 100)}% 100%`
                }} 
              />
            </div>
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
        />
        <ScoreItem
          icon={EyeOff}
          title={language === 'sv' ? 'Avindexering' : 'Deindexing'}
          score={score.individual.urls}
        />
        <ScoreItem
          icon={MapPinHouse}
          title={language === 'sv' ? 'Adresslarm' : 'Address Alerts'}
          score={score.individual.address}
        />
        <ScoreItem
          icon={MousePointerClick}
          title={language === 'sv' ? 'Guider' : 'Guides'}
          score={score.individual.guides}
        />
      </div>
    </div>
  );
};

