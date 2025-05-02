
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { CustomerWithProfile } from "@/types/customer";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { sv, enUS } from "date-fns/locale";
import { SubscriptionPlanSelect } from "./SubscriptionPlanSelect";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

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
  const { toast } = useToast();
  const { language, t } = useLanguage();
  const [isUpdatingMrkoll, setIsUpdatingMrkoll] = useState(false);
  
  const handleMrkollRemovalChange = async (checked: boolean) => {
    if (!customer.id) return;
    
    setIsUpdatingMrkoll(true);
    try {
      const timestamp = checked ? new Date().toISOString() : null;
      
      const { error } = await supabase
        .from('profiles')
        .update({ mrkoll_removal_checked_at: timestamp })
        .eq('id', customer.id);
        
      if (error) throw error;
      
      toast({
        title: language === 'sv' ? 'Uppdaterad' : 'Updated',
        description: language === 'sv' 
          ? 'Mrkoll borttagningsstatus har uppdaterats' 
          : 'Mrkoll removal status has been updated'
      });
      
    } catch (error) {
      console.error('Error updating Mrkoll removal status:', error);
      toast({
        title: language === 'sv' ? 'Fel' : 'Error',
        description: language === 'sv'
          ? 'Kunde inte uppdatera Mrkoll borttagningsstatus'
          : 'Failed to update Mrkoll removal status',
        variant: "destructive"
      });
    } finally {
      setIsUpdatingMrkoll(false);
    }
  };

  return (
    <div className="w-full md:max-w-[220px]">
      <div className="space-y-6">
        {isSuperAdmin && (
          <div className="space-y-2">
            <p className="text-xs text-[#808080] dark:text-[#ABABAB]">{t('subscription')}</p>
            <SubscriptionPlanSelect 
              currentPlan={customer.subscription_plan || ''} 
              onUpdatePlan={onUpdateSubscriptionPlan}
              isUpdating={isUpdatingSubscription}
            />
          </div>
        )}
        
        {isSuperAdmin && (
          <div className="space-y-2">
            <p className="text-xs text-[#808080] dark:text-[#ABABAB]">
              {language === 'sv' ? 'Borttagning Mrkoll' : 'Removal Mrkoll'}
            </p>
            <div className="flex items-center gap-2">
              <Checkbox 
                id="mrkoll-removal"
                disabled={isUpdatingMrkoll}
                checked={!!customer.profile?.mrkoll_removal_checked_at}
                onCheckedChange={handleMrkollRemovalChange}
              />
              <div className="text-xs">
                {customer.profile?.mrkoll_removal_checked_at ? (
                  <span className="text-xs text-[#000000] dark:text-[#FFFFFF]">
                    {format(new Date(customer.profile.mrkoll_removal_checked_at), 'yyyy-MM-dd HH:mm')}
                  </span>
                ) : (
                  <span className="text-xs text-[#808080] dark:text-[#ABABAB]">
                    {language === 'sv' ? 'Inte kontrollerad' : 'Not checked'}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
