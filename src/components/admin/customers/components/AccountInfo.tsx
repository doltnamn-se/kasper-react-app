
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { CustomerWithProfile } from "@/types/customer";
import { Check } from "lucide-react";
import { format } from "date-fns";
import { SubscriptionPlanSelect } from "./SubscriptionPlanSelect";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { useCustomerPrivacyScore } from "@/hooks/useCustomerPrivacyScore";

interface AccountInfoProps {
  customer: CustomerWithProfile;
  isOnline: boolean;
  userLastSeen: string | null;
  onCopy: (text: string, label: string) => void;
  isSuperAdmin: boolean;
  isUpdatingSubscription: boolean;
  onUpdateSubscriptionPlan: (plan: string) => void;
}

export const AccountInfo = ({
  customer,
  isUpdatingSubscription,
  onUpdateSubscriptionPlan,
  isSuperAdmin,
}: AccountInfoProps) => {
  const { language, t } = useLanguage();
  const [isUpdatingMrkoll, setIsUpdatingMrkoll] = useState(false);
  const { calculateScore } = useCustomerPrivacyScore(customer.id || '');
  
  const handleMrkollRemovalChange = async (value: string) => {
    if (!customer.id) return;
    
    setIsUpdatingMrkoll(true);
    try {
      const timestamp = value === "checked" ? new Date().toISOString() : null;
      
      const { error } = await supabase
        .from('profiles')
        .update({ mrkoll_removal_checked_at: timestamp })
        .eq('id', customer.id);
        
      if (error) throw error;
      
      // Toast notification removed
      
    } catch (error) {
      console.error('Error updating Mrkoll removal status:', error);
      // Toast error notification also removed
    } finally {
      setIsUpdatingMrkoll(false);
    }
  };

  const privacyScore = calculateScore();

  return (
    <div className="w-full md:max-w-[220px]">
      <div className="space-y-6">
        {isSuperAdmin && (
          <div className="space-y-2">
            <p className="text-xs text-[#000000] dark:text-[#FFFFFF]">{t('subscription')}</p>
            <SubscriptionPlanSelect 
              currentPlan={customer.subscription_plan || ''} 
              onUpdatePlan={onUpdateSubscriptionPlan}
              isUpdating={isUpdatingSubscription}
            />
          </div>
        )}
        
        {isSuperAdmin && (
          <div className="space-y-2">
            <p className="text-xs text-[#000000] dark:text-[#FFFFFF]">
              {language === 'sv' ? 'Borttagning Mrkoll' : 'Removal Mrkoll'}
            </p>
            <RadioGroup 
              disabled={isUpdatingMrkoll}
              value={customer.profile?.mrkoll_removal_checked_at ? "checked" : "unchecked"}
              onValueChange={handleMrkollRemovalChange}
              className="flex items-center gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem 
                  value="checked" 
                  id="mrkoll-checked"
                  className="bg-[#f5f5f5] dark:bg-[#121212] border-[#c7c7c7] dark:border-[#393939]"
                />
                <div className="text-xs">
                  {customer.profile?.mrkoll_removal_checked_at ? (
                    <span className="text-xs text-[#000000] dark:text-[#FFFFFF]">
                      {format(new Date(customer.profile.mrkoll_removal_checked_at), 'yyyy-MM-dd HH:mm')}
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-[#000000] dark:text-[#FFFFFF]">
                      {t('mrkoll.not.checked')}
                    </span>
                  )}
                </div>
              </div>
            </RadioGroup>
          </div>
        )}

        {isSuperAdmin && (
          <div className="space-y-2">
            <p className="text-xs text-[#000000] dark:text-[#FFFFFF]">
              Privacy Score
            </p>
            <div className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF]">
              {privacyScore}%
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
