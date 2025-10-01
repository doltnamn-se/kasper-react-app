
import { useGuideService } from "@/services/guideService";
import { useState } from "react";
import { useMemberStatusUpdates } from "./useMemberStatusUpdates";
import { openUrl } from "@/services/browserService";

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

    await openUrl(guide.steps[0].text);

    try {
      await updateMemberSiteStatus(siteName, 'Granskar');
    } finally {
      setIsOpening(false);
    }
  };

  return { handleRemoveSite, isOpening };
};
