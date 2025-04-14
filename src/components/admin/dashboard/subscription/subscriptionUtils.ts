
import { useLanguage } from "@/contexts/LanguageContext";

export interface SubscriptionData {
  plan: string;
  count: number;
  customer_type?: string;
  created_at?: string;
}

// Define the order of subscription plans
const PLAN_ORDER = {
  '1_month': 1,
  '6_month': 2,
  '12_month': 3,
  '24_month': 4,
  'none': 5
};

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
    const data = subscriptionData
      .map((item) => ({
        name: formatPlanName(item.plan),
        plan: item.plan,
        value: item.count,
        percentage: ((item.count / total) * 100).toFixed(1)
      }))
      // Sort based on defined plan order
      .sort((a, b) => {
        const orderA = PLAN_ORDER[a.plan as keyof typeof PLAN_ORDER] || 999;
        const orderB = PLAN_ORDER[b.plan as keyof typeof PLAN_ORDER] || 999;
        return orderA - orderB;
      });
    
    return { data, total };
  };
  
  return { formatPlanName, processSubscriptionData };
};
