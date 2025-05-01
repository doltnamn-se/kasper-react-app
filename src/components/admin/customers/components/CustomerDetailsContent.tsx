import { CustomerWithProfile } from "@/types/customer";
import { CustomerAvatar } from "./CustomerAvatar";
import { CustomerDetails } from "./CustomerDetails";
import { CustomerBadges } from "./CustomerBadges";
import { AccountInfo } from "./AccountInfo";
import { AdminActions, AdminActionButtons } from "./AdminActions";
import { UrlSubmissions } from "./UrlSubmissions";
import { SiteStatusManager } from "./SiteStatusManager";
import { ChecklistProgress } from "./ChecklistProgress";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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
  const [addressInfo, setAddressInfo] = useState<string>('');
  
  // Get display name or fallback to a default
  const customerName = customer.profile?.display_name || 'Customer';
  
  // Fetch address information when customer ID changes
  useEffect(() => {
    const fetchAddressInfo = async () => {
      if (!customer.id) return;
      
      // First try to get the address from the customer_checklist_progress.address field
      const { data: progressData, error: progressError } = await supabase
        .from('customer_checklist_progress')
        .select('address, street_address, postal_code, city')
        .eq('customer_id', customer.id)
        .single();
        
      if (progressError) {
        console.error("Error fetching address info:", progressError);
        return;
      }
      
      if (progressData) {
        // First check if there's a direct address field available
        if (progressData.address) {
          setAddressInfo(progressData.address);
          customer.address = progressData.address;
          return;
        }
        
        // Otherwise, construct from the individual fields
        const addressParts = [
          progressData.street_address, 
          progressData.postal_code ? `${progressData.postal_code}` : '',
          progressData.city
        ].filter(Boolean);
        
        const fullAddress = addressParts.join(', ');
        setAddressInfo(fullAddress || '');
        
        // Update the customer object with the address information
        customer.address = fullAddress || '';
      }
    };
    
    fetchAddressInfo();
  }, [customer.id]);
  
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
          <h3 className="text-base font-medium text-[#000000] dark:text-[#FFFFFFA6]">{customerName}</h3>
          <div className="flex flex-col items-start gap-4">
            <CustomerAvatar customer={customer} progressPercentage={customer.checklist_completed ? 100 : 0} />
            <div className="flex flex-col sm:flex-row gap-8">
              <div>
                <CustomerDetails customer={customer} />
                <div className="mt-4">
                  <CustomerBadges customer={customer} />
                </div>
              </div>
              <AccountInfo 
                customer={customer}
                isOnline={isOnline}
                userLastSeen={userLastSeen}
                onCopy={onCopy}
              />
            </div>
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
