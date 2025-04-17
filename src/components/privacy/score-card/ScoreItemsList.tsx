
import React from 'react';
import { ScoreItem } from './ScoreItem';
import { MousePointerClick, MapPinHouse, EyeOff, UserSearch } from "lucide-react";
import { useSiteStatusBadge } from '@/utils/siteStatusUtils';
import { useUserProfile } from '@/hooks/useUserProfile';

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
  incomingUrls?: { status: string }[];
}

export const ScoreItemsList = ({
  language,
  scores,
  completedUrls,
  totalUrls,
  completedGuidesCount,
  totalGuidesCount,
  hasAddress,
  incomingUrls
}: ScoreItemsListProps) => {
  const { userProfile } = useUserProfile();
  const siteStatusBadge = useSiteStatusBadge([
    'Eniro',
    'Mrkoll',
    'Hitta',
    'Merinfo',
    'Ratsit',
    'Birthday',
    'Upplysning'
  ], userProfile?.id);

  return (
    <div className="space-y-2">
      <ScoreItem
        icon={MousePointerClick}
        title={language === 'sv' ? 'Upplysningssidor' : 'Search sites'}
        score={scores.guides}
        showProgress={false}
        showBadge={true}
        badgeText={siteStatusBadge.text}
        badgeVariant={siteStatusBadge.variant}
        language={language}
      />
      <ScoreItem
        icon={EyeOff}
        title={language === 'sv' ? 'Länkar' : 'Links'}
        score={scores.urls}
        showProgress={false}
        showBadge={true}
        isLinks={true}
        incomingUrls={incomingUrls}
        language={language}
      />
      <ScoreItem
        icon={UserSearch}
        title={language === 'sv' ? 'Bevakning' : 'Monitoring'}
        score={scores.monitoring}
        showProgress={false}
        showBadge={true}
        language={language}
      />
      <ScoreItem
        icon={MapPinHouse}
        title={language === 'sv' ? 'Adresslarm' : 'Address Alerts'}
        score={scores.address}
        showProgress={false}
        showBadge={true}
        isAddress={true}
        language={language}
      />
    </div>
  );
};
