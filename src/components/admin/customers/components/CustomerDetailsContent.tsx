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
import { AdminUrlSubmission } from "./AdminUrlSubmission";
import { Separator } from "@/components/ui/separator";
import { IdVerificationSection } from "./IdVerificationSection";

import { MemberManagerPanel } from "../members/MemberManagerPanel";
interface CustomerDetailsContentProps {
  customer: CustomerWithProfile;
  isOnline: boolean;
  userLastSeen: string | null;
  onCopy: (text: string, label: string) => void;
  usedUrls: number;
  totalUrlLimit: number;
  isSuperAdmin: boolean;
  isBanned?: boolean;
  isSendingEmail: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isUpdatingSubscription: boolean;
  isTogglingBan?: boolean;
  onSendActivationEmail: () => void;
  onDeleteUser: () => void;
  onUpdateSubscriptionPlan: (plan: string) => void;
  onBanUser?: () => void;
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
  isBanned = false,
  isSendingEmail,
  isUpdating,
  isDeleting,
  isUpdatingSubscription,
  isTogglingBan = false,
  onSendActivationEmail,
  onDeleteUser,
  onUpdateSubscriptionPlan,
  onBanUser,
  onRefresh,
  isRefreshing = false
}: CustomerDetailsContentProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [copiedTitle, setCopiedTitle] = useState(false);
  const [fadeInActive, setFadeInActive] = useState(false);
  const [fadeOutActive, setFadeOutActive] = useState(false);
  const [showMembersDialog, setShowMembersDialog] = useState(false);
  const {
    t
} = useLanguage();

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
  return <div className="px-6 py-6 relative bg-[#FFFFFF] dark:bg-[#161617]">
      {isSuperAdmin && <AdminActionButtons isSendingEmail={isSendingEmail} onSendActivationEmail={onSendActivationEmail} setShowDeleteDialog={setShowDeleteDialog} onRefreshData={onRefresh} isRefreshing={isRefreshing} onBanUser={onBanUser} onDeleteUser={onDeleteUser} isTogglingBan={isTogglingBan} isBanned={isBanned} onManageMembers={() => setShowMembersDialog((v) => !v)} isManagingMembers={showMembersDialog} />}
      {showMembersDialog && (
        <div className="space-y-8 mt-16 md:mt-12">
          <MemberManagerPanel customerId={customer.id} customerName={customerName} />
        </div>
      )}
      
      <div className={`${showMembersDialog ? 'hidden' : ''} space-y-8 mt-16 md:mt-12`}>
        <div className="space-y-8 md:space-y-6">
          <div className="flex items-center gap-3 pt-2 md:pt-0">
            <CustomerAvatar customer={customer} progressPercentage={customer.checklist_completed ? 100 : 0} />
            <div className="flex items-center gap-2">
              <h3 className="text-base font-medium text-black dark:text-white">{customerName}</h3>
              <Button variant="ghost" size="icon" className="h-6 w-6 bg-transparent hover:bg-transparent text-[#000000A6] hover:text-[#000000] dark:text-[#FFFFFFA6] dark:hover:text-[#FFFFFF]" onClick={handleCopyTitle}>
                {copiedTitle ? <Check className="h-4 w-4 text-green-500 animate-draw-check [stroke-dasharray:24] [stroke-linecap:round] [stroke-linejoin:round]" style={{
                strokeDashoffset: 0
              }} /> : <Copy className={`h-4 w-4 ${fadeInActive ? 'animate-fade-in' : ''} ${fadeOutActive ? 'animate-fade-out' : ''}`} />}
              </Button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-8">
            <CustomerDetails customer={customer} onCopy={onCopy} />
            <AccountInfo customer={customer} isOnline={isOnline} userLastSeen={userLastSeen} onCopy={onCopy} isSuperAdmin={isSuperAdmin} isUpdatingSubscription={isUpdatingSubscription} onUpdateSubscriptionPlan={onUpdateSubscriptionPlan} />
          </div>
        </div>

        <AdminActions customerId={customer.id} isSuperAdmin={isSuperAdmin} isSendingEmail={isSendingEmail} isUpdating={isUpdating} isDeleting={isDeleting} onSendActivationEmail={onSendActivationEmail} onDeleteUser={onDeleteUser} />

        {/* First separator with consistent padding */}
        <div className="pt-3 pb-5">
          <Separator />
        </div>

        {/* URL submission section with consistent spacing */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-base font-medium text-[#000000] dark:text-[#FFFFFF]">{t('deindexing.title')}</h3>
            
            {/* URL data fields */}
            <UrlSubmissions usedUrls={usedUrls} totalUrlLimit={totalUrlLimit} />
            
            {/* URL input field - moved below the data display */}
            {isSuperAdmin && <AdminUrlSubmission customerId={customer.id} />}
          </div>

          
          <SiteStatusManager customerId={customer.id} />


          {/* ID Verification section - moved to bottom */}
          {isSuperAdmin && (
            <div className="pt-3 pb-5">
              <Separator />
              <div className="pt-6">
                <IdVerificationSection customerId={customer.id} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>;
};
