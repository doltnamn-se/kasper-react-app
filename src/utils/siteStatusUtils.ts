
import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteStatuses } from "@/hooks/useSiteStatuses";

type BadgeVariant = 'green' | 'red' | 'yellow';

export const useSiteStatusBadge = (sites: string[], userId?: string) => {
  const { siteStatuses } = useSiteStatuses(userId);
  const { language } = useLanguage();

  const getSiteStatusBadge = () => {
    if (!siteStatuses || siteStatuses.length === 0) {
      return {
        text: language === 'sv' ? 'Granskar' : 'Reviewing',
        variant: 'yellow' as BadgeVariant
      };
    }

    const statuses = sites.map(site => 
      siteStatuses.find(status => status.site_name === site)?.status || 'Granskar'
    );

    const uniqueStatuses = new Set(statuses);

    if (uniqueStatuses.size === 1) {
      const status = uniqueStatuses.values().next().value;
      switch (status) {
        case 'Granskar':
          return {
            text: language === 'sv' ? 'Granskar' : 'Reviewing',
            variant: 'yellow' as BadgeVariant
          };
        case 'Synlig':
          return {
            text: language === 'sv' ? 'Synlig' : 'Visible',
            variant: 'red' as BadgeVariant
          };
        case 'Dold':
        case 'Adress dold':
          return {
            text: language === 'sv' ? 'Dold' : 'Hidden',
            variant: 'green' as BadgeVariant
          };
        case 'Borttagen':
          return {
            text: language === 'sv' ? 'Borttagen' : 'Removed',
            variant: 'green' as BadgeVariant
          };
      }
    }

    // Mixed statuses
    return {
      text: language === 'sv' ? 'Pågående' : 'In progress',
      variant: 'yellow' as BadgeVariant
    };
  };

  return getSiteStatusBadge();
};
