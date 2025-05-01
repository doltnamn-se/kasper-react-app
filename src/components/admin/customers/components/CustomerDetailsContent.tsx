
import { CustomerWithProfile } from "@/types/customer";
import { CustomerAvatar } from "./CustomerAvatar";
import { CustomerDetails } from "./CustomerDetails";
import { CustomerBadges } from "./CustomerBadges";
import { AccountInfo } from "./AccountInfo";
import { AdminActions } from "./AdminActions";
import { UrlSubmissions } from "./UrlSubmissions";
import { SiteStatusManager } from "./SiteStatusManager";
import { ChecklistProgress } from "./ChecklistProgress";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { t } = useLanguage();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Get display name or fallback to a default
  const customerName = customer.profile?.display_name || 'Customer';
  
  return (
    <div className="px-6 py-6 relative">
      {isSuperAdmin && (
        <div className="absolute top-6 right-6 flex flex-col gap-2">
          <button
            onClick={onSendActivationEmail}
            disabled={isSendingEmail}
            className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            {isSendingEmail ? t('sending') : t('resend.activation')}
          </button>
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="text-xs bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          >
            {t('delete.user')}
          </button>
        </div>
      )}
      
      <div className="space-y-8 mt-4">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <CustomerAvatar customer={customer} progressPercentage={customer.checklist_completed ? 100 : 0} />
            <h3 className="text-base font-medium text-black dark:text-white">{customerName}</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-base font-medium text-[#000000] dark:text-[#FFFFFF] mb-4">
                {t('personal.info')}
              </h3>
              <CustomerDetails customer={customer} onCopy={onCopy} />
            </div>
            
            <div>
              <h3 className="text-base font-medium text-[#000000] dark:text-[#FFFFFF] mb-4">
                {t('account.info')}
              </h3>
              <AccountInfo 
                customer={customer}
                isOnline={isOnline}
                userLastSeen={userLastSeen}
                onCopy={onCopy}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <ChecklistProgress 
              progressPercentage={customer.checklist_completed ? 100 : 0}
              completedSteps={customer.checklist_completed ? 1 : 0}
              totalSteps={1}
            />
          </div>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-base font-medium text-[#000000] dark:text-[#FFFFFF] mb-3">
                {t('url.management')}
              </h3>
              <UrlSubmissions usedUrls={usedUrls} totalUrlLimit={totalUrlLimit} />
            </div>
            
            {isSuperAdmin && (
              <div>
                <h3 className="text-base font-medium text-[#000000] dark:text-[#FFFFFF] mb-3">
                  {t('admin.actions')}
                </h3>
                <AdminActions
                  customerId={customer.id}
                  isSuperAdmin={isSuperAdmin}
                  isSendingEmail={isSendingEmail}
                  isDeleting={isDeleting}
                  onSendActivationEmail={onSendActivationEmail}
                  onDeleteUser={onDeleteUser}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
