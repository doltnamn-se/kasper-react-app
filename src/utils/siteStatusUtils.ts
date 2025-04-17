
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

    // Get statuses for the requested sites
    const statuses = sites.map(site => 
      siteStatuses.find(status => status.site_name === site)?.status || 'Granskar'
    );

    console.log('Current site statuses:', statuses);

    // Group related statuses for easier checking
    const hiddenStatuses = ['Dold', 'Borttagen', 'Adress dold'];
    const activeStatuses = ['Synlig'];
    const reviewingStatuses = ['Granskar'];

    // Count occurrences of each status type
    const hiddenCount = statuses.filter(s => hiddenStatuses.includes(s)).length;
    const activeCount = statuses.filter(s => activeStatuses.includes(s)).length;
    const reviewingCount = statuses.filter(s => reviewingStatuses.includes(s)).length;
    const addressDoldCount = statuses.filter(s => s === 'Adress dold').length;
    
    console.log('Status counts:', {
      hiddenCount,
      activeCount,
      reviewingCount,
      addressDoldCount,
      total: statuses.length
    });

    // Case 1: All statuses are the same single status
    const uniqueStatuses = new Set(statuses);
    if (uniqueStatuses.size === 1) {
      const status = uniqueStatuses.values().next().value;
      console.log('All statuses are the same:', status);
      
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
          return {
            text: language === 'sv' ? 'Dold' : 'Hidden',
            variant: 'green' as BadgeVariant
          };
        case 'Borttagen':
          return {
            text: language === 'sv' ? 'Borttagen' : 'Removed',
            variant: 'green' as BadgeVariant
          };
        case 'Adress dold':
          return {
            text: language === 'sv' ? 'Dold' : 'Hidden',
            variant: 'green' as BadgeVariant
          };
        default:
          return {
            text: language === 'sv' ? 'Pågående' : 'In progress',
            variant: 'yellow' as BadgeVariant
          };
      }
    }

    // Case 2: Special case - when all sites are either 'Dold' or 'Borttagen'
    if (hiddenCount === sites.length) {
      console.log('All sites are hidden/removed');
      return {
        text: language === 'sv' ? 'Dold' : 'Hidden',
        variant: 'green' as BadgeVariant
      };
    }
    
    // Case 3: Special case - when 5 are "Dold"/"Borttagen" and 1 is "Adress dold"
    if (hiddenCount === sites.length && 
        (statuses.filter(s => s === 'Dold' || s === 'Borttagen').length === sites.length - 1) && 
        addressDoldCount === 1) {
      console.log('5 Dold/Borttagen and 1 Adress dold');
      return {
        text: language === 'sv' ? 'Dold' : 'Hidden',
        variant: 'green' as BadgeVariant
      };
    }
    
    // Case 4: All sites are active (Synlig)
    if (activeCount === sites.length) {
      console.log('All sites are active');
      return {
        text: language === 'sv' ? 'Synlig' : 'Visible',
        variant: 'red' as BadgeVariant
      };
    }
    
    // Case 5: Mix of hidden types (Dold, Borttagen) with no other types
    if (hiddenCount === sites.length) {
      console.log('All sites are one of the hidden types');
      return {
        text: language === 'sv' ? 'Dold' : 'Hidden',
        variant: 'green' as BadgeVariant
      };
    }

    // Default case: Mixed statuses (any other combination)
    console.log('Mixed statuses - using default');
    return {
      text: language === 'sv' ? 'Pågående' : 'In progress',
      variant: 'yellow' as BadgeVariant
    };
  };

  return getSiteStatusBadge();
};
