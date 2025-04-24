
import { useGuideData } from "@/hooks/useGuideData";
import { useIncomingUrls } from "@/hooks/useIncomingUrls";
import { useChecklistProgress } from "@/hooks/useChecklistProgress";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useAddressData } from "@/components/address/hooks/useAddressData";
import { URLStatusStep } from "@/types/url-management";
import { useSiteStatusBadge } from "@/utils/siteStatusUtils";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserProfile } from "@/hooks/useUserProfile";

export const usePrivacyScore = () => {
  const { incomingUrls } = useIncomingUrls();
  const { addressData } = useAddressData();
  const { language } = useLanguage();
  const { userProfile } = useUserProfile();
  
  // Ensure we're using the same userId as in the UI components
  const siteStatusBadge = useSiteStatusBadge([
    'Eniro',
    'Mrkoll',
    'Hitta',
    'Merinfo',
    'Ratsit',
    'Birthday',
    'Upplysning'
  ], userProfile?.id);

  const calculateScore = () => {
    console.log('Calculating privacy score with new weights');
    console.log('Site status badge:', siteStatusBadge);

    // Initialize base scores
    let scores = {
      sites: 0,      // Upplysningssidor - 25% if "Dold"
      urls: 0,       // Länkar - 25% if "Inga länkar" or "Länkar borttagna"
      monitoring: 25, // Bevakning - Always 25% (always active)
      address: 0     // Adresslarm - 25% if active
    };

    // Check Upplysningssidor status based on the badge variant
    if (siteStatusBadge.variant === 'green') {
      scores.sites = 25;
      console.log('Site status is green, adding 25 points');
    } else {
      console.log('Site status is not qualifying for points:', siteStatusBadge);
    }

    // Check URLs status
    if (incomingUrls) {
      const allRemoved = incomingUrls.every(url => url.status === 'removal_approved');
      if (!incomingUrls.length || allRemoved) {
        scores.urls = 25;
      }
    } else {
      scores.urls = 25; // No URLs is considered complete
    }

    // Check Address status
    if (addressData?.street_address) {
      scores.address = 25;
    }

    // Calculate total score
    const totalScore = scores.sites + scores.urls + scores.monitoring + scores.address;

    console.log('Individual scores:', scores);
    console.log('Total score:', totalScore);

    return {
      total: totalScore,
      individual: {
        guides: scores.sites * 2,    // Convert to percentage (out of 50%)
        urls: scores.urls * 2,       // Convert to percentage (out of 50%)
        monitoring: scores.monitoring * 2, // Convert to percentage (out of 50%)
        address: scores.address * 2   // Convert to percentage (out of 50%)
      }
    };
  };

  return { calculateScore };
};
