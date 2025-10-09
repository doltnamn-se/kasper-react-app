
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { CustomerWithProfile } from "@/types/customer";
import { SubscriptionPlanSelect } from "./SubscriptionPlanSelect";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
  const [isUpdatingCustomerType, setIsUpdatingCustomerType] = useState(false);
  
  const handleCustomerTypeToggle = async () => {
    if (!customer.id) return;
    
    setIsUpdatingCustomerType(true);
    try {
      const newType = customer.customer_type === 'private' ? 'business' : 'private';
      
      const { error } = await supabase
        .from('customers')
        .update({ customer_type: newType })
        .eq('id', customer.id);
        
      if (error) throw error;
      
      toast.success(
        language === 'sv' 
          ? `Kundtyp ändrad till ${newType === 'private' ? 'Privatkund' : 'Företagskund'}` 
          : `Customer type changed to ${newType === 'private' ? 'Private' : 'Business'}`
      );
      
    } catch (error) {
      console.error('Error updating customer type:', error);
      toast.error(
        language === 'sv' 
          ? 'Kunde inte uppdatera kundtyp' 
          : 'Failed to update customer type'
      );
    } finally {
      setIsUpdatingCustomerType(false);
    }
  };

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
              {language === 'sv' ? 'Kundtyp' : 'Customer Type'}
            </p>
            <Button
              onClick={handleCustomerTypeToggle}
              disabled={isUpdatingCustomerType}
              variant="outline"
              size="sm"
              className="w-full text-xs"
            >
              {customer.customer_type === 'private' 
                ? (language === 'sv' ? 'Privatkund → Företagskund' : 'Private → Business')
                : (language === 'sv' ? 'Företagskund → Privatkund' : 'Business → Private')
              }
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
