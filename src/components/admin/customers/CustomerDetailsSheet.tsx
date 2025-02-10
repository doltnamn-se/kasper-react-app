
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CustomerWithProfile } from "@/types/customer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCustomerPresence } from "./useCustomerPresence";
import { useCustomerData } from "./hooks/useCustomerData";
import { CustomerAvatar } from "./components/CustomerAvatar";
import { CustomerDetails } from "./components/CustomerDetails";
import { CustomerBadges } from "./components/CustomerBadges";
import { AccountInfo } from "./components/AccountInfo";
import { UrlSubmissions } from "./components/UrlSubmissions";
import { ChecklistProgress } from "./components/ChecklistProgress";
import { AdminActions } from "./components/AdminActions";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useCustomerActions } from "./hooks/useCustomerActions";
import { toast } from "sonner";

interface CustomerDetailsSheetProps {
  customer: CustomerWithProfile | null;
  onOpenChange: (open: boolean) => void;
}

export const CustomerDetailsSheet = ({ customer, onOpenChange }: CustomerDetailsSheetProps) => {
  const { onlineUsers, lastSeen } = useCustomerPresence();
  const { t } = useLanguage();
  const { data: customerData, isLoading, refetch: refetchData } = useCustomerData(customer);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [additionalUrls, setAdditionalUrls] = useState<string>("");

  const {
    isUpdating,
    isSendingEmail,
    handleUpdateUrlLimits,
    handleResendActivationEmail,
    handleDeleteUser
  } = useCustomerActions(customer?.id, () => onOpenChange(false));

  // Fetch current URL limits
  useEffect(() => {
    const fetchUrlLimits = async () => {
      if (!customer?.id) return;
      
      const { data, error } = await supabase
        .from('user_url_limits')
        .select('additional_urls')
        .eq('customer_id', customer.id)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching URL limits:", error);
        return;
      }
      
      if (data) {
        setAdditionalUrls(data.additional_urls.toString());
      }
    };

    fetchUrlLimits();
  }, [customer?.id]);

  useEffect(() => {
    const checkSuperAdmin = async () => {
      const { data, error } = await supabase.rpc('is_super_admin');
      if (!error && data) {
        setIsSuperAdmin(data);
      }
    };
    checkSuperAdmin();
  }, []);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t('toast.copied.title'), {
      description: `${label} ${t('toast.copied.description')}`
    });
  };

  const handleUrlLimitsUpdate = async () => {
    const success = await handleUpdateUrlLimits(additionalUrls);
    if (success) {
      refetchData();
    }
  };

  if (!customer) return null;

  const isOnline = customer.id ? onlineUsers.has(customer.id) : false;
  const userLastSeen = customer.id ? lastSeen[customer.id] : null;

  const usedUrls = customerData?.urls?.length || 0;
  const totalUrlLimit = (customerData?.limits?.additional_urls || 0);

  if (isLoading) {
    return (
      <Sheet open={!!customer} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="sm:max-w-xl w-full p-0">
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={!!customer} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-xl w-full p-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="px-6 py-6">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="flex flex-col items-center text-center">
                  <CustomerAvatar customer={customer} progressPercentage={customer.checklist_completed ? 100 : 0} />
                  <CustomerDetails customer={customer} />
                </div>
                <CustomerBadges customer={customer} />
              </div>

              <div className="border-t border-[#eaeaea] dark:border-[#2e2e2e]">
                <div className="py-4 space-y-6">
                  <AccountInfo 
                    customer={customer}
                    isOnline={isOnline}
                    userLastSeen={userLastSeen}
                    onCopy={handleCopy}
                  />
                  
                  <AdminActions
                    customerId={customer.id}
                    isSuperAdmin={isSuperAdmin}
                    isSendingEmail={isSendingEmail}
                    isUpdating={isUpdating}
                    additionalUrls={additionalUrls}
                    onSendActivationEmail={() => {
                      if (customer.profile?.email && customer.profile?.display_name) {
                        handleResendActivationEmail(
                          customer.profile.email,
                          customer.profile.display_name
                        );
                      }
                    }}
                    onUpdateUrlLimits={handleUrlLimitsUpdate}
                    onDeleteUser={handleDeleteUser}
                    setAdditionalUrls={setAdditionalUrls}
                  />

                  <UrlSubmissions usedUrls={usedUrls} totalUrlLimit={totalUrlLimit} />
                  
                  <ChecklistProgress 
                    progressPercentage={customer.checklist_completed ? 100 : 0}
                    completedSteps={customer.checklist_completed ? 1 : 0}
                    totalSteps={1}
                  />
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
