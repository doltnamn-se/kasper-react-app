import React from 'react';
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface ScoreItemProps { 
  icon: React.ElementType; 
  title: string; 
  score: number;
  progress?: string;
  showProgress?: boolean;
  showBadge?: boolean;
  badgeText?: string;
  badgeVariant?: 'green' | 'red' | 'yellow';
  isAddress?: boolean;
  language: string;
  incomingUrls?: { status: string }[];
  isLinks?: boolean;
}

export const ScoreItem = ({ 
  icon: Icon, 
  title, 
  score,
  progress,
  showProgress = true,
  showBadge,
  badgeText,
  badgeVariant,
  isAddress,
  language,
  incomingUrls,
  isLinks
}: ScoreItemProps) => {
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

  const getLinksBadgeContent = () => {
    if (!incomingUrls || incomingUrls.length === 0) {
      return language === 'sv' ? 'Inga länkar' : 'No links';
    }

    const allRemoved = incomingUrls.every(url => url.status === 'removal_approved');
    if (allRemoved) {
      return language === 'sv' ? 'Länkar borttagna' : 'Links removed';
    }

    return language === 'sv' ? 'Borttagning pågår' : 'Removal in progress';
  };

  const getLinksBadgeStyle = () => {
    if (!incomingUrls || incomingUrls.length === 0) {
      return "text-[#097c4f] dark:text-[#85e0ba] bg-[#3fcf8e1a] dark:bg-[#3ecf8e1a] border-[#16b674] dark:border-[#006239]";
    }
    const allRemoved = incomingUrls.every(url => url.status === 'removal_approved');
    return allRemoved
      ? "text-[#097c4f] dark:text-[#85e0ba] bg-[#3fcf8e1a] dark:bg-[#3ecf8e1a] border-[#16b674] dark:border-[#006239]"
      : "text-[#8C6107] dark:text-[#ffe7af] bg-[#FFF4CC] border-[#FEC84B] dark:bg-[#fec84b1a] dark:border-[#8c6107]";
  };

  const getBadgeStyle = () => {
    switch (badgeVariant) {
      case 'green':
        return "text-[#097c4f] dark:text-[#85e0ba] bg-[#3fcf8e1a] dark:bg-[#3ecf8e1a] border-[#16b674] dark:border-[#006239]";
      case 'red':
        return "text-[#ca3214] dark:text-[#f16a50] bg-[#e54d2e1a] border-[#f3b0a2] dark:border-[#7f2315]";
      case 'yellow':
        return "text-[#8C6107] dark:text-[#ffe7af] bg-[#FFF4CC] border-[#FEC84B] dark:bg-[#fec84b1a] dark:border-[#8c6107]";
      default:
        return "text-[#097c4f] dark:text-[#85e0ba] bg-[#3fcf8e1a] dark:bg-[#3ecf8e1a] border-[#16b674] dark:border-[#006239]";
    }
  };

  const [current, total] = progress?.split('/') || [];

  return (
    <div className="space-y-2 p-3 rounded-lg">
      <div className="flex items-center">
        <div className="flex items-center space-x-2 flex-1">
          <Icon className={cn("w-5 h-5 text-[#000000] dark:text-[#FFFFFF]")} />
          <div className="text-sm font-medium">{title}</div>
        </div>
        {showProgress && progress && (
          <div className="flex-1 text-center">
            <span className="text-sm font-medium">
              <span className="text-[#000000] dark:text-[#FFFFFF]">{current}</span>
              <span className="text-[#000000A6] dark:text-[#FFFFFFA6]">/{total}</span>
            </span>
          </div>
        )}
        <div className="flex items-center gap-3 flex-1 justify-end">
          {showBadge ? (
            <Badge 
              variant="secondary" 
              className={cn(
                "border",
                isLinks ? getLinksBadgeStyle() :
                (isAddress && score === 0) 
                  ? "text-[#ca3214] dark:text-[#f16a50] bg-[#e54d2e1a] border-[#f3b0a2] dark:border-[#7f2315]"
                  : badgeVariant ? getBadgeStyle() : "text-[#097c4f] dark:text-[#85e0ba] bg-[#3fcf8e1a] dark:bg-[#3ecf8e1a] border-[#16b674] dark:border-[#006239]"
              )}
            >
              {isLinks ? getLinksBadgeContent() :
                (isAddress && score === 0) 
                  ? (language === 'sv' ? 'Inaktiv' : 'Inactive')
                  : badgeText || (language === 'sv' ? 'Aktiv' : 'Active')
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
