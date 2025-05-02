
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { CustomerWithProfile } from "@/types/customer";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
  isOnline,
  userLastSeen,
  onCopy,
  isSuperAdmin,
  isUpdatingSubscription,
  onUpdateSubscriptionPlan,
}: AccountInfoProps) => {
  const { toast } = useToast();
  const { language, t } = useLanguage();
  const [isCopied, setIsCopied] = useState(false);
  const [isUpdatingMrkoll, setIsUpdatingMrkoll] = useState(false);

  const handleCopyEmail = () => {
    if (customer?.profile?.email) {
      onCopy(customer.profile.email, t('email'));
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const formatLastSeen = (dateString: string) => {
    try {
      const options = {
        locale: language === 'sv' ? sv : enUS
      };
      return formatDistanceToNow(new Date(dateString), options);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };
  
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
      <h4 className="text-sm font-medium text-[#808080] mb-3 dark:text-[#ABABAB]">
        {t('account')}
      </h4>

      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#808080] dark:text-[#ABABAB]">
              {t('email')}
            </p>
            <Button variant="ghost" size="icon" onClick={handleCopyEmail} className="h-5 w-5 bg-transparent hover:bg-transparent p-0 text-[#000000A6] hover:text-[#000000] dark:text-[#FFFFFFA6] dark:hover:text-[#FFFFFF]">
              {isCopied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>
          <p className="text-xs font-medium text-[#000000] dark:text-[#FFFFFF] break-all">{customer?.profile?.email || 'No email provided'}</p>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-[#808080] dark:text-[#ABABAB]">{t('status')}</p>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-[#00FF00]' : 'bg-[#FF0000]'}`}></div>
            <span className="text-xs font-medium text-[#000000] dark:text-[#FFFFFF]">
              {isOnline 
                ? t('online') 
                : userLastSeen 
                  ? `${t('last.seen')} ${formatLastSeen(userLastSeen)} ${t('ago')}` 
                  : t('offline')
              }
            </span>
          </div>
        </div>

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
