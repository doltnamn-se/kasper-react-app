
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";
import { CustomerWithProfile } from "@/types/customer";
import { SubscriptionPlanSelect } from "./SubscriptionPlanSelect";
import { useState } from "react";

interface AccountInfoProps {
  customer: CustomerWithProfile;
  isOnline: boolean;
  userLastSeen: string | null;
  onCopy: (text: string, label: string) => void;
  isSuperAdmin?: boolean;
  isUpdatingSubscription?: boolean;
  onUpdateSubscriptionPlan?: (plan: string) => void;
}

export const AccountInfo = ({ 
  customer, 
  isOnline, 
  userLastSeen, 
  onCopy, 
  isSuperAdmin = false,
  isUpdatingSubscription = false,
  onUpdateSubscriptionPlan
}: AccountInfoProps) => {
  const { t } = useLanguage();
  const [copiedFields, setCopiedFields] = useState<Record<string, boolean>>({});
  const [fadeInActive, setFadeInActive] = useState<Record<string, boolean>>({});
  const [fadeOutActive, setFadeOutActive] = useState<Record<string, boolean>>({});

  // Helper function to get the appropriate subscription label
  const getSubscriptionLabel = (plan: string | null) => {
    switch(plan) {
      case '1_month':
        return t('subscription.1month');
      case '3_months':
        return t('subscription.3months');
      case '6_months':
        return t('subscription.6months');
      case '12_months':
        return t('subscription.12months');
      case '24_months':
        return t('subscription.24months');
      default:
        return t('subscription.none');
    }
  };

  const handleCopy = (text: string, label: string, fieldId: string) => {
    // First trigger fade out animation
    setFadeOutActive(prev => ({ ...prev, [fieldId]: true }));
    
    // After fade out completes, show the checkmark
    setTimeout(() => {
      setFadeOutActive(prev => ({ ...prev, [fieldId]: false }));
      
      // Use the onCopy from props
      onCopy(text, label);
      
      // Show copied animation
      setCopiedFields(prev => ({ ...prev, [fieldId]: true }));
      
      // After animation, set fade-in state to true
      setTimeout(() => {
        setCopiedFields(prev => ({ ...prev, [fieldId]: false }));
        setFadeInActive(prev => ({ ...prev, [fieldId]: true }));
        
        // Reset fade-in state after animation completes
        setTimeout(() => {
          setFadeInActive(prev => ({ ...prev, [fieldId]: false }));
        }, 300);
      }, 1000);
    }, 200);
  };

  return (
    <div className="space-y-4">
      {/* Customer ID field added here */}
      <div className="space-y-1">
        <p className="text-xs font-normal text-[#000000] dark:text-[#FFFFFF]">{t('customer.id')}</p>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-[#000000] dark:text-[#FFFFFF]">{customer.id}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 bg-transparent hover:bg-transparent text-[#000000A6] hover:text-[#000000] dark:text-[#FFFFFFA6] dark:hover:text-[#FFFFFF]"
            onClick={() => handleCopy(customer.id, t('customer.id'), 'customer-id')}
          >
            {copiedFields['customer-id'] ? (
              <Check 
                className="h-4 w-4 text-green-500 animate-draw-check [stroke-dasharray:24] [stroke-linecap:round] [stroke-linejoin:round]" 
                style={{ strokeDashoffset: 0 }}
              />
            ) : (
              <Copy className={`h-4 w-4 ${fadeInActive['customer-id'] ? 'animate-fade-in' : ''} ${fadeOutActive['customer-id'] ? 'animate-fade-out' : ''}`} />
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-xs font-normal text-[#000000] dark:text-[#FFFFFF]">{t('subscription')}</p>
        
        {isSuperAdmin && onUpdateSubscriptionPlan ? (
          <SubscriptionPlanSelect 
            currentPlan={customer.subscription_plan}
            isUpdating={isUpdatingSubscription}
            onUpdatePlan={onUpdateSubscriptionPlan}
          />
        ) : (
          <span className="text-xs font-medium text-[#000000] dark:text-[#FFFFFF]">
            {getSubscriptionLabel(customer.subscription_plan)}
          </span>
        )}
      </div>
    </div>
  );
};
