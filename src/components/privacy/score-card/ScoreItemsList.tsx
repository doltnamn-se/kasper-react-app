
import React from 'react';
import { ScoreItem } from './ScoreItem';
import { MousePointerClick, MapPinHouse, EyeOff, UserSearch } from "lucide-react";

interface ScoreItemsListProps {
  language: string;
  scores: {
    monitoring: number;
    urls: number;
    address: number;
    guides: number;
  };
  completedUrls: number;
  totalUrls: number;
  completedGuidesCount: number;
  totalGuidesCount: number;
  hasAddress: boolean;
}

export const ScoreItemsList = ({
  language,
  scores,
  completedUrls,
  totalUrls,
  completedGuidesCount,
  totalGuidesCount,
  hasAddress
}: ScoreItemsListProps) => {
  return (
    <div className="space-y-2">
      <ScoreItem
        icon={UserSearch}
        title={language === 'sv' ? 'Bevakning' : 'Monitoring'}
        score={scores.monitoring}
        progress="1/1"
        showBadge={true}
        language={language}
      />
      <ScoreItem
        icon={EyeOff}
        title={language === 'sv' ? 'Länkar' : 'Links'}
        score={scores.urls}
        progress={`${completedUrls}/${totalUrls || 1}`}
        language={language}
      />
      <ScoreItem
        icon={MapPinHouse}
        title={language === 'sv' ? 'Adresslarm' : 'Address Alerts'}
        score={scores.address}
        progress={hasAddress ? "1/1" : "0/1"}
        showBadge={true}
        isAddress={true}
        language={language}
      />
      <ScoreItem
        icon={MousePointerClick}
        title={language === 'sv' ? 'Guider' : 'Guides'}
        score={scores.guides}
        progress={`${completedGuidesCount}/${totalGuidesCount}`}
        language={language}
      />
    </div>
  );
};
