
import { useChecklistProgress } from "./useChecklistProgress";
import { useQueryClient } from "@tanstack/react-query";

export const useGuideCompletion = () => {
  // Return a no-op function since we're removing this functionality
  const handleGuideComplete = async (siteId: string) => {
    console.log('Guide completion functionality has been removed');
    return;
  };

  return { handleGuideComplete };
};
