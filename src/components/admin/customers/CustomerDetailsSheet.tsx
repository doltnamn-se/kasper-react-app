
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
import { SiteStatusManager } from "./components/SiteStatusManager";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useCustomerActions } from "./hooks/useCustomerActions";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Drawer, 
  DrawerContent
} from "@/components/ui/drawer";

interface CustomerDetailsSheetProps {
  customer: CustomerWithProfile | null;
  onOpenChange: (open: boolean) => void;
}

export const CustomerDetailsSheet = ({ customer, onOpenChange }: CustomerDetailsSheetProps) => {
  // Always call hooks at the top level, regardless of whether customer is null or not
  const { onlineUsers, lastSeen } = useCustomerPresence();
  const { t } = useLanguage();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [additionalUrls, setAdditionalUrls] = useState<string>("0");
  const isMobile = useIsMobile();
  
  // Use empty ID if customer is null to prevent hook conditionally
  const customerId = customer?.id || "";
  const { data: customerData, isLoading, refetch: refetchData } = useCustomerData(customerId);

  const {
    isUpdating,
    isSendingEmail,
    isDeleting,
    handleUpdateUrlLimits,
    handleResendActivationEmail,
    handleDeleteUser
  } = useCustomerActions(customerId || "", () => onOpenChange(false));

  useEffect(() => {
    const fetchUrlLimits = async () => {
      if (!customerId) return;
      
      const { data, error } = await supabase
        .from('user_url_limits')
        .select('additional_urls')
        .eq('customer_id', customerId)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching URL limits:", error);
        return;
      }
      
      if (data) {
        setAdditionalUrls(data.additional_urls.toString());
      } else {
        setAdditionalUrls("0");
      }
    };

    if (customerId) {
      fetchUrlLimits();
    }
  }, [customerId]);

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
    if (!customerId) return;
    const success = await handleUpdateUrlLimits(additionalUrls);
    if (success) {
      refetchData();
    }
  };

  // Return null early but AFTER all hooks have been called
  if (!customer) return null;

  const isOnline = customer.id ? onlineUsers.has(customer.id) : false;
  const userLastSeen = customer.id ? lastSeen[customer.id] : null;

  const usedUrls = customerData?.urls?.length || 0;
  const totalUrlLimit = (customerData?.limits?.additional_urls || 0);

  if (isLoading) {
    return isMobile ? (
      <Drawer open={!!customer} onOpenChange={onOpenChange}>
        <DrawerContent className="px-4 pb-4 pt-6">
          <div className="flex items-center justify-center h-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
          </div>
        </DrawerContent>
      </Drawer>
    ) : (
      <Sheet open={!!customer} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="sm:max-w-xl w-full p-0">
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  const customerDetailsContent = (
    <div className="px-6 py-6">
      <div className="space-y-8">
        <div className="space-y-6">
          <h3 className="text-sm font-semibold text-[#000000] dark:text-white">User Details</h3>
          <div className="flex flex-col items-start gap-4">
            <CustomerAvatar customer={customer} progressPercentage={customer.checklist_completed ? 100 : 0} />
            <CustomerDetails customer={customer} />
            <CustomerBadges customer={customer} />
          </div>
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
  );

  return isMobile ? (
    <Drawer open={!!customer} onOpenChange={onOpenChange}>
      <DrawerContent className="px-0 pb-16 max-h-[85vh]">
        <ScrollArea className="h-full max-h-[85vh] overflow-y-auto">
          {customerDetailsContent}
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  ) : (
    <Sheet open={!!customer} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-xl w-full p-0 overflow-hidden">
        <ScrollArea className="h-full">
          {customerDetailsContent}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
