
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { CustomerWithProfile } from "@/types/customer";
import { CustomerAvatar } from "./CustomerAvatar";
import { CustomerDetails } from "./CustomerDetails";
import { CustomerBadges } from "./CustomerBadges";
import { AccountInfo } from "./AccountInfo";
import { AdminActions, AdminActionButtons } from "./AdminActions";
import { UrlSubmissions } from "./UrlSubmissions";
import { SiteStatusManager } from "./SiteStatusManager";
import { Copy, Check } from "lucide-react";

interface CustomerDetailsContentProps {
  customer: CustomerWithProfile;
  isOnline: boolean;
  userLastSeen: string | null;
  onCopy: (text: string, label: string) => void;
  usedUrls: number;
  totalUrlLimit: number;
  isSuperAdmin: boolean;
  isSendingEmail: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  additionalUrls: string;
  onSendActivationEmail: () => void;
  onUpdateUrlLimits: () => void;
  onDeleteUser: () => void;
  onBanUser?: () => void;
  setAdditionalUrls: (urls: string) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const CustomerDetailsContent = ({
  customer,
  isOnline,
  userLastSeen,
  onCopy,
  usedUrls,
  totalUrlLimit,
  isSuperAdmin,
  isSendingEmail,
  isUpdating,
  isDeleting,
  additionalUrls,
  onSendActivationEmail,
  onUpdateUrlLimits,
  onDeleteUser,
  onBanUser,
  setAdditionalUrls,
  onRefresh,
  isRefreshing = false
}: CustomerDetailsContentProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [copiedTitle, setCopiedTitle] = useState(false);
  const [fadeInActive, setFadeInActive] = useState(false);
  const [fadeOutActive, setFadeOutActive] = useState(false);
  const { t } = useLanguage();
  
  // Get display name or fallback to a default
  const customerName = customer.profile?.display_name || 'Customer';
  
  const handleCopyTitle = () => {
    // First trigger fade out animation
    setFadeOutActive(true);
    
    // After fade out completes, show the checkmark
    setTimeout(() => {
      setFadeOutActive(false);
      
      // Copy the text and show notification
      onCopy(customerName, t('name'));
      
      // Set copied state to true to show checkmark
      setCopiedTitle(true);
      
      // After animation, set fade-in state to true
      setTimeout(() => {
        setCopiedTitle(false);
        setFadeInActive(true);
        
        // Reset fade-in state after animation completes
        setTimeout(() => {
          setFadeInActive(false);
        }, 300);
      }, 1000);
    }, 200);
  };
  
  return (
    <div className="px-6 py-6 relative">
      {isSuperAdmin && (
        <AdminActionButtons
          isSendingEmail={isSendingEmail}
          onSendActivationEmail={onSendActivationEmail}
          setShowDeleteDialog={setShowDeleteDialog}
          onRefreshData={onRefresh}
          isRefreshing={isRefreshing}
          onBanUser={onBanUser}
        />
      )}
      
      <div className="space-y-8 mt-16 md:mt-12">
        <div className="space-y-8 md:space-y-6">
          <div className="flex items-center gap-3 pt-2 md:pt-0">
            <CustomerAvatar customer={customer} progressPercentage={customer.checklist_completed ? 100 : 0} />
            <div className="flex items-center gap-2">
              <h3 className="text-base font-medium text-black dark:text-white">{customerName}</h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 bg-transparent hover:bg-transparent text-[#000000A6] hover:text-[#000000] dark:text-[#FFFFFFA6] dark:hover:text-[#FFFFFF]"
                onClick={handleCopyTitle}
              >
                {copiedTitle ? (
                  <Check 
                    className="h-4 w-4 text-green-500 animate-draw-check [stroke-dasharray:24] [stroke-linecap:round] [stroke-linejoin:round]" 
                    style={{ strokeDashoffset: 0 }}
                  />
                ) : (
                  <Copy className={`h-4 w-4 ${fadeInActive ? 'animate-fade-in' : ''} ${fadeOutActive ? 'animate-fade-out' : ''}`} />
                )}
              </Button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-8">
            <CustomerDetails customer={customer} onCopy={onCopy} />
            <AccountInfo 
              customer={customer}
              isOnline={isOnline}
              userLastSeen={userLastSeen}
              onCopy={onCopy}
            />
          </div>
        </div>

        <div>
          <div className="py-4 space-y-6">
            <AdminActions
              customerId={customer.id}
              isSuperAdmin={isSuperAdmin}
              isSendingEmail={isSendingEmail}
              isUpdating={isUpdating}
              isDeleting={isDeleting}
              additionalUrls={additionalUrls}
              onSendActivationEmail={onSendActivationEmail}
              onUpdateUrlLimits={onUpdateUrlLimits}
              onDeleteUser={onDeleteUser}
              setAdditionalUrls={setAdditionalUrls}
            />

            <UrlSubmissions usedUrls={usedUrls} totalUrlLimit={totalUrlLimit} />
            
            <SiteStatusManager customerId={customer.id} />
          </div>
        </div>
      </div>
    </div>
  );
};
