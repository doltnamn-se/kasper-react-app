import React, { useCallback } from 'react';
import { ScoreItem } from './ScoreItem';
import { SearchX, MapPinHouse, EyeOff, UserSearch } from "lucide-react";
import { useSiteStatusBadge } from '@/utils/siteStatusUtils';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useBreakpoint } from '@/hooks/useBreakpoint';

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
  const isDesktop = useBreakpoint('(min-width: 768px)');
  const siteStatusBadge = useSiteStatusBadge([
    'Eniro',
    'Mrkoll',
    'Hitta',
    'Merinfo',
    'Ratsit',
    'Birthday',
    'Upplysning'
  ], userProfile?.id);

  const handleUplysningClick = useCallback(() => {
    const statusWidget = document.getElementById('status-widget');
    if (!statusWidget) return;

    if (isDesktop) {
      statusWidget.classList.add('ring-4', 'ring-primary', 'ring-opacity-50');
      setTimeout(() => {
        statusWidget.classList.remove('ring-4', 'ring-primary', 'ring-opacity-50');
      }, 2000);
    } else {
      statusWidget.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isDesktop]);

  return (
    <div className="space-y-2">
      <ScoreItem
        icon={SearchX}
        title={language === 'sv' ? 'Upplysningssidor' : 'Search sites'}
        score={scores.guides}
        showProgress={false}
        showBadge={true}
        badgeText={siteStatusBadge.text}
        badgeVariant={siteStatusBadge.variant}
        language={language}
        onClick={handleUplysningClick}
        showTooltip={siteStatusBadge.text === (language === 'sv' ? 'Begäran skickad' : 'Request sent')}
        tooltipText="Tooltip text will be added here"
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
        linkTo="/deindexing"
      />
      <ScoreItem
        icon={UserSearch}
        title={language === 'sv' ? 'Bevakning' : 'Monitoring'}
        score={scores.monitoring}
        showProgress={false}
        showBadge={true}
        language={language}
        linkTo="/monitoring"
      />
      <ScoreItem
        icon={MapPinHouse}
        title={language === 'sv' ? 'Adresslarm' : 'Address Alerts'}
        score={scores.address}
        showProgress={false}
        showBadge={true}
        isAddress={true}
        language={language}
        linkTo="/address-alerts"
      />
    </div>
  );
};
