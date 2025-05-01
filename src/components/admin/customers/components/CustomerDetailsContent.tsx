
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
  setAdditionalUrls: (urls: string) => void;
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
  setAdditionalUrls
}: CustomerDetailsContentProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { t } = useLanguage();
  
  // Get display name or fallback to a default
  const customerName = customer.profile?.display_name || 'Customer';
  
  return (
    <div className="px-6 py-6 relative">
      {isSuperAdmin && (
        <AdminActionButtons
          isSendingEmail={isSendingEmail}
          onSendActivationEmail={onSendActivationEmail}
          setShowDeleteDialog={setShowDeleteDialog}
        />
      )}
      
      <div className="space-y-8 mt-12">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <CustomerAvatar customer={customer} progressPercentage={customer.checklist_completed ? 100 : 0} />
            <h3 className="text-base font-medium text-black dark:text-white">{customerName}</h3>
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
