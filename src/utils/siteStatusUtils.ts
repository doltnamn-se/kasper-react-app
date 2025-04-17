
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
    const filteredSiteStatuses = sites
      .map(site => siteStatuses.find(status => status.site_name === site))
      .filter(status => status !== undefined)
      .map(status => status!.status);
      
    // If no matching sites found, use default
    if (filteredSiteStatuses.length === 0) {
      console.log('No matching sites found, returning Reviewing/yellow');
      return {
        text: language === 'sv' ? 'Granskar' : 'Reviewing',
        variant: 'yellow' as BadgeVariant
      };
    }
    
    console.log('Filtered site statuses:', filteredSiteStatuses);
    
    // 1. If ALL are Synlig, it says Synlig (red)
    const allAreSynlig = filteredSiteStatuses.length > 0 && 
                         filteredSiteStatuses.every(status => status === 'Synlig');
    
    if (allAreSynlig) {
      console.log('RULE 1 MATCH: All sites are Synlig, returning Synlig/red badge');
      return {
        text: language === 'sv' ? 'Synlig' : 'Visible',
        variant: 'red' as BadgeVariant
      };
    }
    
    // 2. If ALL are Dold, Borttagen or Adress dold, it says "Dold" (green)
    const hiddenTypes = ['Dold', 'Borttagen', 'Adress dold'];
    const allAreHiddenTypes = filteredSiteStatuses.length > 0 && 
                             filteredSiteStatuses.every(status => hiddenTypes.includes(status));
    
    if (allAreHiddenTypes) {
      console.log('RULE 2 MATCH: All sites are hidden types, returning Dold/green badge');
      return {
        text: language === 'sv' ? 'Dold' : 'Hidden',
        variant: 'green' as BadgeVariant
      };
    }
    
    // 3. All other combinations return "Pågående" (yellow)
    console.log('RULE 3 MATCH: Mixed statuses, returning Pågående/yellow badge');
    return {
      text: language === 'sv' ? 'Pågående' : 'In progress',
      variant: 'yellow' as BadgeVariant
    };
  };

  return getSiteStatusBadge();
};
