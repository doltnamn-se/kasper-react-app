import { useLanguage } from "@/contexts/LanguageContext";

export interface SubscriptionData {
  plan: string;
  count: number;
  customer_type?: string;
  created_at?: string;
}

const PLAN_ORDER = {
  '1_month': 1,
  '3_months': 2,
  '6_months': 3,
  '12_months': 4,
  '24_months': 5,
  'none': 6
};

export const useSubscriptionFormatter = () => {
  const { t } = useLanguage();
  
  const formatPlanName = (plan: string): string => {
    const uiPlanKey = plan.replace('_', '');
    return t(`subscription.${uiPlanKey}` as any);
  };
  
  const processSubscriptionData = (subscriptionData: SubscriptionData[]) => {
    const total = subscriptionData.reduce((sum, item) => sum + item.count, 0);
    
    const data = subscriptionData
      .map((item) => ({
        name: formatPlanName(item.plan),
        plan: item.plan,
        value: item.count,
        percentage: ((item.count / total) * 100).toFixed(1)
      }))
      .sort((a, b) => {
        const orderA = PLAN_ORDER[a.plan as keyof typeof PLAN_ORDER] || 999;
        const orderB = PLAN_ORDER[b.plan as keyof typeof PLAN_ORDER] || 999;
        return orderA - orderB;
      });
    
    return { data, total };
  };
  
  return { formatPlanName, processSubscriptionData };
};
