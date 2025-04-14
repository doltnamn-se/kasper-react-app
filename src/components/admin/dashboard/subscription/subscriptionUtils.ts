
import { useLanguage } from "@/contexts/LanguageContext";

export interface SubscriptionData {
  plan: string;
  count: number;
  customer_type?: string;
  created_at?: string;
}

export const useSubscriptionFormatter = () => {
  const { t } = useLanguage();
  
  // Format the plan name for display
  const formatPlanName = (plan: string): string => {
    // Convert plan from database format (e.g., '1_month') to UI format (e.g., '1month')
    const uiPlanKey = plan.replace('_', '');
    return t(`subscription.${uiPlanKey}` as any);
  };
  
  // Process subscription data for chart display
  const processSubscriptionData = (subscriptionData: SubscriptionData[]) => {
    const total = subscriptionData.reduce((sum, item) => sum + item.count, 0);
    
    // Prepare data for the chart with percentages
    const data = subscriptionData.map((item) => ({
      name: formatPlanName(item.plan),
      plan: item.plan,
      value: item.count,
      percentage: ((item.count / total) * 100).toFixed(1)
    }));
    
    return { data, total };
  };
  
  return { formatPlanName, processSubscriptionData };
};
