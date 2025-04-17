
import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteStatuses } from "@/hooks/useSiteStatuses";

type BadgeVariant = 'green' | 'red' | 'yellow';

export const useSiteStatusBadge = (sites: string[], userId?: string) => {
  const { siteStatuses } = useSiteStatuses(userId);
  const { language } = useLanguage();

  const getSiteStatusBadge = () => {
    if (!siteStatuses || siteStatuses.length === 0) {
      console.log('No siteStatuses, returning Reviewing/yellow');
      return {
        text: language === 'sv' ? 'Granskar' : 'Reviewing',
        variant: 'yellow' as BadgeVariant
      };
    }

    // Get statuses for the requested sites
    const statuses = sites.map(site => 
      siteStatuses.find(status => status.site_name === site)?.status || 'Granskar'
    );

    console.log('Current site statuses:', statuses);

    // SIMPLIFIED RULE 1: If ALL are Synlig, return Synlig (red)
    const allSynlig = statuses.every(status => status === 'Synlig');
    if (allSynlig) {
      console.log('Rule 1: All sites are Synlig');
      return {
        text: language === 'sv' ? 'Synlig' : 'Visible',
        variant: 'red' as BadgeVariant
      };
    }

    // SIMPLIFIED RULE 2: If ALL are Dold/Borttagen/Adress dold, return Dold (green)
    const allHiddenTypes = ['Dold', 'Borttagen', 'Adress dold'];
    const allHidden = statuses.every(status => allHiddenTypes.includes(status));
    
    if (allHidden) {
      console.log('Rule 2: All sites are hidden types (Dold, Borttagen, or Adress dold)');
      return {
        text: language === 'sv' ? 'Dold' : 'Hidden',
        variant: 'green' as BadgeVariant
      };
    }

    // SIMPLIFIED RULE 3: For any other combination, return Pågående (yellow)
    console.log('Rule 3: Mixed statuses - defaulting to Pågående');
    return {
      text: language === 'sv' ? 'Pågående' : 'In progress',
      variant: 'yellow' as BadgeVariant
    };
  };

  return getSiteStatusBadge();
};
