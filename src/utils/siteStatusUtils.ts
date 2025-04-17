
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
    
    // 1. If ALL are Synlig, it says Synlig (red)
    if (statuses.length > 0 && statuses.every(status => status === 'Synlig')) {
      console.log('Rule 1 applied: All statuses are Synlig -> badge = Synlig (red)');
      return {
        text: language === 'sv' ? 'Synlig' : 'Visible',
        variant: 'red' as BadgeVariant
      };
    }
    
    // 2. If ALL are Dold, Borttagen or Adress dold or all of these mixed with each other, it says "Dold" (green)
    const hiddenTypes = ['Dold', 'Borttagen', 'Adress dold'];
    const onlyHiddenStatuses = statuses.length > 0 && statuses.every(status => hiddenTypes.includes(status));
    
    if (onlyHiddenStatuses) {
      console.log('Rule 2 applied: All statuses are hidden types -> badge = Dold (green)');
      return {
        text: language === 'sv' ? 'Dold' : 'Hidden',
        variant: 'green' as BadgeVariant
      };
    }
    
    // 3. All other ways it says "Pågående (yellow)
    console.log('Rule 3 applied: Mixed statuses -> badge = Pågående (yellow)');
    return {
      text: language === 'sv' ? 'Pågående' : 'In progress',
      variant: 'yellow' as BadgeVariant
    };
  };

  return getSiteStatusBadge();
};
