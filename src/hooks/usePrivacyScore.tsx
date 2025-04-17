
import { useGuideData } from "@/hooks/useGuideData";
import { useIncomingUrls } from "@/hooks/useIncomingUrls";
import { useChecklistProgress } from "@/hooks/useChecklistProgress";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useAddressData } from "@/components/address/hooks/useAddressData";
import { URLStatusStep } from "@/types/url-management";

export const usePrivacyScore = () => {
  const { getGuides } = useGuideData();
  const { incomingUrls } = useIncomingUrls();
  const { checklistProgress } = useChecklistProgress();
  const { addressData } = useAddressData();
  const allGuides = getGuides();

  const { data: subscriptionPlan } = useQuery({
    queryKey: ['subscription-plan'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return null;

      const { data: customer } = await supabase
        .from('customers')
        .select('subscription_plan')
        .eq('id', session.user.id)
        .single();

      return customer?.subscription_plan;
    }
  });

  const calculateScore = () => {
    console.log('Calculating privacy score with:', {
      allGuides,
      incomingUrls,
      subscriptionPlan,
      completedGuides: checklistProgress?.completed_guides,
      addressData
    });

    // Initialize weights based on subscription plan
    let weights = {
      guides: subscriptionPlan === '1_month' ? 0.4 : 0.25,
      address: subscriptionPlan === '1_month' ? 0.4 : 0.25,
      urls: subscriptionPlan === '1_month' ? 0 : 0.25,
      monitoring: subscriptionPlan === '1_month' ? 0.2 : 0.25 // Updated to 0.25 for non-1_month plans
    };

    console.log('Using weights:', weights);

    // Simply check if there's a street address present
    const hasAddress = Boolean(addressData?.street_address);

    console.log('Address check:', {
      hasAddress,
      addressData
    });

    // Calculate individual scores with detailed logging
    const scores = {
      guides: allGuides.length > 0 ? 
        ((checklistProgress?.completed_guides?.length || 0) / allGuides.length) : 1,
      address: hasAddress ? 1 : 0,
      urls: calculateUrlScore(),
      monitoring: 1 // Always 100% as we're always monitoring
    };

    console.log('Individual scores before weighting:', scores);

    // Calculate weighted total with detailed logging
    const totalScore = Object.keys(weights).reduce((total, key) => {
      const weightedScore = scores[key as keyof typeof scores] * weights[key as keyof typeof weights];
      console.log(`${key} weighted score:`, weightedScore);
      return total + weightedScore;
    }, 0);

    console.log('Final total score:', totalScore);

    return {
      total: Math.round(totalScore * 100),
      individual: {
        guides: Math.round(scores.guides * 100),
        address: Math.round(scores.address * 100),
        urls: Math.round(scores.urls * 100),
        monitoring: Math.round(scores.monitoring * 100)
      }
    };
  };

  const getStatusWeight = (status: URLStatusStep): number => {
    const weights: Record<URLStatusStep, number> = {
      'received': 0.25,
      'case_started': 0.50,
      'request_submitted': 0.75,
      'removal_approved': 1.0
    };
    return weights[status] || 0;
  };

  const calculateUrlScore = () => {
    if (subscriptionPlan === '1_month') return 1; // Not applicable for 1-month plan
    if (!incomingUrls?.length) return 1; // No URLs submitted is considered complete

    console.log('Calculating URL score with:', {
      incomingUrls,
      urlsCount: incomingUrls.length
    });

    // Calculate weighted progress for each URL
    const totalProgress = incomingUrls.reduce((sum, url) => {
      const weight = getStatusWeight(url.status as URLStatusStep);
      console.log(`URL ${url.id} status: ${url.status}, weight: ${weight}`);
      return sum + weight;
    }, 0);

    const score = totalProgress / incomingUrls.length;
    console.log('URL score calculation:', {
      totalProgress,
      urlCount: incomingUrls.length,
      finalScore: score
    });

    return score;
  };

  return { calculateScore };
};
