import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePrivacyScore } from "@/hooks/usePrivacyScore";
import { Progress } from "@/components/ui/progress";
import { MousePointerClick, MapPinHouse, EyeOff, UserSearch, Loader } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useIncomingUrls } from "@/hooks/useIncomingUrls";
import { useGuideData } from "@/hooks/useGuideData";
import { useAddressData } from "@/components/address/hooks/useAddressData";

export const PrivacyScoreCard = () => {
  const { calculateScore } = usePrivacyScore();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const score = calculateScore();
  const { incomingUrls } = useIncomingUrls();
  const { getGuides } = useGuideData();
  const { addressData } = useAddressData();
  const allGuides = getGuides();
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    setAnimatedScore(0);
    const timeout = setTimeout(() => {
      setAnimatedScore(score.total);
    }, 100);
    return () => clearTimeout(timeout);
  }, [score.total]);

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

  const completedUrls = incomingUrls?.filter(url => url.status === 'removal_approved')?.length || 0;
  const totalUrls = incomingUrls?.length || 0;

  const completedGuides = score.individual.guides;
  const completedGuidesCount = Math.round((completedGuides / 100) * allGuides.length);

  const ScoreItem = ({ 
    icon: Icon, 
    title, 
    score,
    progress,
    showBadge,
    isAddress
  }: { 
    icon: any; 
    title: string; 
    score: number;
    progress: string;
    showBadge?: boolean;
    isAddress?: boolean;
  }) => {
    const segments = 10;
    const radius = 6;
    const centerPoint = 10;
    const lineLength = 3;

    const getSegmentPath = (index: number, progress: number) => {
      const angle = (index * 360) / segments;
      const rad = (angle * Math.PI) / 180;
      const innerX = centerPoint + radius * Math.cos(rad);
      const innerY = centerPoint + radius * Math.sin(rad);
      const outerX = centerPoint + (radius + lineLength) * Math.cos(rad);
      const outerY = centerPoint + (radius + lineLength) * Math.sin(rad);

      return {
        path: `M ${innerX} ${innerY} L ${outerX} ${outerY}`,
        visible: index <= Math.floor((progress / 100) * segments),
        color: progress <= 25 ? '#e64028' : '#16B674'
      };
    };

    const [current, total] = progress.split('/');

    return (
      <div className="space-y-2 p-3 rounded-lg">
        <div className="flex items-center">
          <div className="flex items-center space-x-2 flex-1">
            <Icon className={cn("w-5 h-5 text-[#000000] dark:text-[#FFFFFF]")} />
            <div className="text-sm font-medium">{title}</div>
          </div>
          <div className="flex-1 text-center">
            <span className="text-sm font-medium">
              <span className="text-[#000000] dark:text-[#FFFFFF]">{current}</span>
              <span className="text-[#000000A6] dark:text-[#FFFFFFA6]">/{total}</span>
            </span>
          </div>
          <div className="flex items-center gap-3 flex-1 justify-end">
            {showBadge ? (
              <Badge 
                variant="secondary" 
                className={cn(
                  "border",
                  (isAddress && score === 0) 
                    ? "text-[#ca3214] dark:text-[#f16a50] bg-[#e54d2e1a] border-[#f3b0a2] dark:border-[#7f2315]"
                    : "text-[#097c4f] dark:text-[#85e0ba] bg-[#3fcf8e1a] dark:bg-[#3ecf8e1a] border-[#16b674] dark:border-[#006239]"
                )}
              >
                {isAddress && score === 0 
                  ? language === 'sv' ? 'Inaktiv' : 'Inactive'
                  : language === 'sv' ? 'Aktiv' : 'Active'
                }
              </Badge>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 20 20" className="relative">
                  {Array.from({ length: segments }).map((_, i) => (
                    <path
                      key={`bg-${i}`}
                      d={getSegmentPath(i, 0).path}
                      stroke="#e8e8e5"
                      strokeWidth="2"
                      strokeLinecap="round"
                      className="dark:stroke-[#2f2e31]"
                    />
                  ))}
                  {Array.from({ length: segments }).map((_, i) => {
                    const segment = getSegmentPath(i, score);
                    if (!segment.visible) return null;
                    return (
                      <path
                        key={`progress-${i}`}
                        d={segment.path}
                        stroke={segment.color}
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    );
                  })}
                </svg>
                <span className={cn("text-sm font-semibold text-[#000000] dark:text-[#FFFFFF]")}>
                  {score}%
                </span>
              </>
            )}
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
                  left: `${animatedScore}%`,
                  transform: 'translateX(-50%)',
                  clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
                  width: '3.5px',
                  height: '2.5rem',
                  borderRadius: '5px',
                  position: 'absolute',
                  bottom: '5px',
                  transition: 'left 1000ms ease-out',
                }}
                className="dark:bg-gradient-to-b dark:from-transparent dark:via-white/20 dark:to-white bg-gradient-to-b from-transparent via-black/20 to-black"
              />
            </div>
            <div className="relative w-full h-3 rounded-lg overflow-hidden">
              <div className="absolute inset-0 bg-[#e8e8e5] dark:bg-[#2f2e31]" />
              <div 
                className="absolute top-0 left-0 h-full transition-all rounded-r-lg"
                style={{ 
                  width: `${animatedScore}%`,
                  background: `linear-gradient(90deg, 
                    rgba(234, 56, 76, 1) 0%,
                    rgb(249, 115, 22) 35%,
                    rgba(251, 209, 4, 255) 70%,
                    rgba(17, 84, 242, 255) 88%,
                    rgba(25, 208, 91, 255) 100%
                  )`,
                  backgroundSize: `${100 / (score.total / 100)}% 100%`,
                  transition: 'width 1000ms ease-out'
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
          progress="1/1"
          showBadge={true}
        />
        <ScoreItem
          icon={EyeOff}
          title={language === 'sv' ? 'Avindexering' : 'Deindexing'}
          score={score.individual.urls}
          progress={`${completedUrls}/${totalUrls || 1}`}
        />
        <ScoreItem
          icon={MapPinHouse}
          title={language === 'sv' ? 'Adresslarm' : 'Address Alerts'}
          score={score.individual.address}
          progress={addressData?.street_address ? "1/1" : "0/1"}
          showBadge={true}
          isAddress={true}
        />
        <ScoreItem
          icon={MousePointerClick}
          title={language === 'sv' ? 'Guider' : 'Guides'}
          score={score.individual.guides}
          progress={`${completedGuidesCount}/${allGuides.length}`}
        />
      </div>
    </div>
  );
};
