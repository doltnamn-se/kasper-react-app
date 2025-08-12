
import { useGuideService } from "@/services/guideService";
import { useState } from "react";
import { useMemberStatusUpdates } from "./useMemberStatusUpdates";

export const useMemberGuideOpener = (customerId?: string, memberId?: string) => {
  const { getGuideForSite } = useGuideService();
  const { updateMemberSiteStatus } = useMemberStatusUpdates(customerId, memberId);
  const [isOpening, setIsOpening] = useState(false);

  const handleRemoveSite = async (siteName: string) => {
    if (!customerId || !memberId) return;
    setIsOpening(true);

    const guide = getGuideForSite(siteName.toLowerCase());
    if (!guide?.steps[0]?.text) {
      setIsOpening(false);
      return;
    }

    window.open(guide.steps[0].text, '_blank');

    try {
      await updateMemberSiteStatus(siteName, 'Granskar');
    } finally {
      setIsOpening(false);
    }
  };

  return { handleRemoveSite, isOpening };
};
