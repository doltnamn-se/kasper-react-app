
import { useGuideService } from "@/services/guideService";
import { useStatusUpdates } from "./useStatusUpdates";
import { useState } from "react";

export const useGuideOpener = () => {
  const { getGuideForSite } = useGuideService();
  const { updateSiteStatus } = useStatusUpdates();
  const [isOpening, setIsOpening] = useState(false);

  const handleRemoveSite = async (siteName: string) => {
    setIsOpening(true);
    console.log(`Handling remove for site: ${siteName}`);
    
    // Get the guide URL and open it in a new tab
    const guide = getGuideForSite(siteName.toLowerCase());
    if (!guide?.steps[0]?.text) {
      console.warn('No guide found for site:', siteName);
      setIsOpening(false);
      return;
    }
    
    // Update status BEFORE opening the window
    const success = await updateSiteStatus(siteName, 'Granskar');
    console.log(`Status update for ${siteName} success:`, success);
    
    if (success) {
      // Only open the guide if the status update was successful
      window.open(guide.steps[0].text, '_blank');
    } else {
      console.error('Failed to update status before opening guide');
    }
    
    setIsOpening(false);
  };

  return {
    handleRemoveSite,
    isOpening
  };
};
