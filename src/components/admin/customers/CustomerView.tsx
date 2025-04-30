
import { Button } from "@/components/ui/button";
import { CustomerWithProfile } from "@/types/customer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCustomerPresence } from "./useCustomerPresence";
import { useCustomerData } from "./hooks/useCustomerData";
import { ArrowLeft } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CustomerAvatar } from "./components/CustomerAvatar";
import { CustomerDetails } from "./components/CustomerDetails";
import { CustomerBadges } from "./components/CustomerBadges";
import { AccountInfo } from "./components/AccountInfo";
import { AdminActions } from "./components/AdminActions";
import { UrlSubmissions } from "./components/UrlSubmissions";
import { SiteStatusManager } from "./components/SiteStatusManager";
import { ChecklistProgress } from "./components/ChecklistProgress";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useCustomerActions } from "./hooks/useCustomerActions";
import { toast } from "sonner";

interface CustomerViewProps {
  customer: CustomerWithProfile;
  onBack: () => void;
}

export const CustomerView = ({ customer, onBack }: CustomerViewProps) => {
  const { onlineUsers, lastSeen } = useCustomerPresence();
  const { t } = useLanguage();
  const { data: customerData, isLoading, refetch: refetchData } = useCustomerData(customer);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [additionalUrls, setAdditionalUrls] = useState<string>("");

  const {
    isUpdating,
    isSendingEmail,
    isDeleting,
    handleUpdateUrlLimits,
    handleResendActivationEmail,
    handleDeleteUser
  } = useCustomerActions(customer?.id, onBack);

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

  const isOnline = customer.id ? onlineUsers.has(customer.id) : false;
  const userLastSeen = customer.id ? lastSeen[customer.id] : null;

  const usedUrls = customerData?.urls?.length || 0;
  const totalUrlLimit = (customerData?.limits?.additional_urls || 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button 
          variant="outline" 
          className="mr-4" 
          size="sm" 
          onClick={onBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('back')}
        </Button>
        <h2 className="text-xl font-semibold dark:text-white">
          {t('customer.details')}
        </h2>
      </div>

      <div className="bg-white dark:bg-[#1c1c1e] rounded-[4px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
        <ScrollArea className="h-[calc(100vh-220px)]">
          <div className="px-6 py-6">
            <div className="space-y-8">
              <div className="space-y-6">
                <h3 className="text-sm font-semibold text-[#000000] dark:text-white">User Details</h3>
                <div className="flex flex-col items-start gap-4">
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
                    isDeleting={isDeleting}
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
                  
                  <SiteStatusManager customerId={customer.id} />

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
      </div>
    </div>
  );
};
