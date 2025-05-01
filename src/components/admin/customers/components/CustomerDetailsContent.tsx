
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatDateDistance } from "@/utils/profileUtils";
import { CustomerWithProfile } from "@/types/customer";
import { CustomerDetails } from "./CustomerDetails";
import { AccountInfo } from "./AccountInfo";
import { ChecklistProgress } from "./ChecklistProgress";
import { SiteStatusManager } from "./SiteStatusManager";
import { CustomerBadges } from "./CustomerBadges";
import { CustomerAvatar } from "./CustomerAvatar";
import { AdminActions } from "./AdminActions";
import { AdminUrlSubmission } from "./AdminUrlSubmission";
import { UrlSubmissions } from "./UrlSubmissions";

interface CustomerDetailsContentProps {
  customer: CustomerWithProfile;
  isOnline: boolean;
  userLastSeen?: Date | null;
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
  setAdditionalUrls: (value: string) => void;
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

  return (
    <div className="p-6 pt-2 space-y-5">
      <div className="flex items-center gap-3 pb-2 border-b border-gray-100 dark:border-gray-800">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => window.history.back()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Button>
        <h2 className="text-base font-semibold">{t('customer.details')}</h2>
      </div>

      <div className="space-y-5">
        <div className="flex flex-col items-center">
          <CustomerAvatar customer={customer} size="lg" />
          
          <div className="mt-3 text-center">
            <h3 className="font-semibold text-base">
              {customer.profile?.display_name || t('customer.unnamed')}
            </h3>
            
            <div className="flex items-center justify-center gap-2 mt-1">
              <CustomerBadges customer={customer} />
            </div>

            <div className="mt-1 text-xs text-[#000000A6] dark:text-[#FFFFFFA6]">
              {isOnline ? (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  {t('online')}
                </span>
              ) : (
                userLastSeen && (
                  <span>
                    {t('last.seen')}: {formatDateDistance(userLastSeen)}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-white dark:bg-black/20 rounded-md p-4 shadow-sm">
              <h4 className="text-sm font-bold mb-3">{t('personal.information')}</h4>
              <CustomerDetails customer={customer} onCopy={onCopy} />
            </div>
            
            <div className="bg-white dark:bg-black/20 rounded-md p-4 shadow-sm">
              <h4 className="text-sm font-bold mb-3">{t('account.info')}</h4>
              <AccountInfo customer={customer} />
            </div>
            
            <div className="bg-white dark:bg-black/20 rounded-md p-4 shadow-sm">
              <h4 className="text-sm font-bold mb-3">{t('checklist.progress')}</h4>
              <ChecklistProgress customer={customer} />
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white dark:bg-black/20 rounded-md p-4 shadow-sm">
              <h4 className="text-sm font-bold mb-3">{t('subscription')}</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <p className="text-xs font-bold text-[#000000] dark:text-[#FFFFFF]">{t('subscription.type')}</p>
                  <span className="text-xs font-medium">{customer.subscription?.plan || t('free')}</span>
                </div>
                
                <div className="flex justify-between">
                  <p className="text-xs font-bold text-[#000000] dark:text-[#FFFFFF]">{t('created')}</p>
                  <span className="text-xs font-medium">
                    {new Date(customer.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <p className="text-xs font-bold text-[#000000] dark:text-[#FFFFFF]">{t('status')}</p>
                  <span className="text-xs font-medium">
                    {isOnline ? t('online') : t('offline')}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <p className="text-xs font-bold text-[#000000] dark:text-[#FFFFFF]">{t('last.seen')}</p>
                  <span className="text-xs font-medium">
                    {userLastSeen ? formatDateDistance(userLastSeen) : t('unknown')}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-black/20 rounded-md p-4 shadow-sm">
              <h4 className="text-sm font-bold mb-3">{t('url.management')}</h4>
              <SiteStatusManager
                usedUrls={usedUrls}
                totalUrlLimit={totalUrlLimit}
              />
              
              <UrlSubmissions customer={customer} />

              {isSuperAdmin && (
                <AdminUrlSubmission
                  additionalUrls={additionalUrls}
                  setAdditionalUrls={setAdditionalUrls}
                  onUpdateUrlLimits={onUpdateUrlLimits}
                  isUpdating={isUpdating}
                />
              )}
            </div>
            
            {isSuperAdmin && (
              <div className="bg-white dark:bg-black/20 rounded-md p-4 shadow-sm">
                <h4 className="text-sm font-bold mb-3">{t('admin.actions')}</h4>
                <AdminActions
                  customer={customer}
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
