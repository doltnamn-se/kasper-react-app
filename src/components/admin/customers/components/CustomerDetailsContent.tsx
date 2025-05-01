
import { CustomerWithProfile } from "@/types/customer";
import { CustomerAvatar } from "./CustomerAvatar";
import { CustomerDetails } from "./CustomerDetails";
import { CustomerBadges } from "./CustomerBadges";
import { AccountInfo } from "./AccountInfo";
import { AdminActions, AdminActionButtons } from "./AdminActions";
import { UrlSubmissions } from "./UrlSubmissions";
import { SiteStatusManager } from "./SiteStatusManager";
import { ChecklistProgress } from "./ChecklistProgress";
import { useState } from "react";

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
  
  return (
    <div className="px-6 py-6 relative">
      {isSuperAdmin && (
        <AdminActionButtons
          isSendingEmail={isSendingEmail}
          onSendActivationEmail={onSendActivationEmail}
          setShowDeleteDialog={setShowDeleteDialog}
        />
      )}
      
      <div className="space-y-8">
        <div className="space-y-6">
          <h3 className="text-base font-medium text-[#000000] dark:text-[#FFFFFFA6]">User Details</h3>
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
              onCopy={onCopy}
            />
            
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
};
