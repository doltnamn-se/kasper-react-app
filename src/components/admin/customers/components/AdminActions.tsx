
import { Button } from "@/components/ui/button";
import { Send, Trash, RefreshCw, Ban, UserRoundPen, ArrowLeft, BadgeCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { AdminUrlSubmission } from "./AdminUrlSubmission";
import { DeleteUserDialog } from "./DeleteUserDialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AdminActionsProps {
  customerId: string;
  isSuperAdmin: boolean;
  isSendingEmail: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  onSendActivationEmail: () => void;
  onDeleteUser: () => void;
}

export const AdminActions = ({
  customerId,
  isSuperAdmin,
  isSendingEmail,
  isUpdating,
  isDeleting,
  onSendActivationEmail,
  onDeleteUser
}: AdminActionsProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { t } = useLanguage();

  if (!isSuperAdmin) return null;

  return (
    <>
      <DeleteUserDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={onDeleteUser}
        isDeleting={isDeleting}
      />
    </>
  );
};

export const AdminActionButtons = ({
  isSendingEmail,
  onSendActivationEmail,
  setShowDeleteDialog,
  onRefreshData,
  isRefreshing = false,
  onBanUser,
  onDeleteUser,
  isTogglingBan = false,
  isBanned = false,
  onManageMembers,
  isManagingMembers = false,
  subscriptionPlan,
  customerId,
}: {
  isSendingEmail: boolean;
  onSendActivationEmail: () => void;
  setShowDeleteDialog: (show: boolean) => void;
  onRefreshData?: () => void;
  isRefreshing?: boolean;
  onBanUser?: () => void;
  onDeleteUser?: () => void;
  isTogglingBan?: boolean;
  isBanned?: boolean;
  onManageMembers?: () => void;
  isManagingMembers?: boolean;
  subscriptionPlan?: string | null;
  customerId: string;
}) => {
  const { toast } = useToast();
  const [idVerification, setIdVerification] = useState<any>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchIdVerification = async () => {
      const { data, error } = await supabase
        .from('id_verifications')
        .select('*')
        .eq('customer_id', customerId)
        .not('document_path', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (!error && data) {
        setIdVerification(data);
      }
    };
    
    if (customerId) {
      fetchIdVerification();
    }
  }, [customerId]);

  const handleDownloadId = async () => {
    if (!idVerification?.document_path) return;
    setDownloading(true);
    try {
      const { data, error } = await supabase.storage
        .from('id_documents')
        .createSignedUrl(idVerification.document_path, 60);
      if (error) throw error;
      const url = data?.signedUrl;
      if (url) window.open(url, '_blank');
    } catch (e) {
      console.error('Download failed', e);
      toast({ 
        title: 'Error', 
        description: 'Failed to download document.', 
        variant: 'destructive' 
      });
    } finally {
      setDownloading(false);
    }
  };
  return (
    <div className="absolute top-8 md:top-6 left-6 right-6 flex items-center justify-between">
      {/* Left-aligned: Manage members and ID card */}
      <div className="flex gap-2">
        {onManageMembers && subscriptionPlan && (subscriptionPlan.includes('parskydd') || subscriptionPlan.includes('familjeskydd')) && (
          <Button
            onClick={onManageMembers}
            variant="outline"
            size="icon"
            title={isManagingMembers ? "Back to profile" : "Manage members"}
            className="hover:bg-transparent text-[#000000A6] hover:text-[#000000] dark:text-[#FFFFFFA6] dark:hover:text-[#FFFFFF]"
          >
            {isManagingMembers ? (
              <ArrowLeft className="h-4 w-4" />
            ) : (
              <UserRoundPen className="h-4 w-4" />
            )}
          </Button>
        )}
        
        {idVerification && (
          <Button
            onClick={handleDownloadId}
            disabled={downloading}
            variant="outline"
            size="icon"
            title="Download ID document"
            className="hover:bg-transparent text-[#000000A6] hover:text-[#000000] dark:text-[#FFFFFFA6] dark:hover:text-[#FFFFFF]"
          >
            <BadgeCheck className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Right-aligned: other actions */}
      <div className="flex gap-2">
        {onRefreshData && (
          <Button
            onClick={onRefreshData}
            disabled={isRefreshing}
            variant="outline"
            size="icon"
            title="Refresh customer data"
            className="hover:bg-transparent text-[#000000A6] hover:text-[#000000] dark:text-[#FFFFFFA6] dark:hover:text-[#FFFFFF]"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        )}
        
        <Button
          onClick={onSendActivationEmail}
          disabled={isSendingEmail}
          variant="outline"
          size="icon"
          title="Resend activation email"
          className="hover:bg-transparent text-[#000000A6] hover:text-[#000000] dark:text-[#FFFFFFA6] dark:hover:text-[#FFFFFF]"
        >
          <Send className="h-4 w-4" />
        </Button>
        
        {onBanUser && (
          <Button
            onClick={onBanUser}
            disabled={isTogglingBan}
            variant="outline"
            size="icon"
            title={isBanned ? "Unban user" : "Ban user"}
            className={`hover:bg-transparent ${isBanned ? 'text-red-500 hover:text-red-600' : 'text-[#000000A6] hover:text-[#000000] dark:text-[#FFFFFFA6] dark:hover:text-[#FFFFFF]'}`}
          >
            <Ban className={`h-4 w-4 ${isTogglingBan ? 'animate-spin' : ''}`} />
          </Button>
        )}
        
        <Button
          onClick={() => {
            if (onDeleteUser) {
              // Call the delete function directly when the button is clicked
              onDeleteUser();
            } else {
              // Fall back to just opening the dialog if no direct delete handler
              setShowDeleteDialog(true);
            }
          }}
          variant="outline"
          size="icon"
          className="hover:bg-transparent text-[#000000A6] hover:text-[#000000] dark:text-[#FFFFFFA6] dark:hover:text-[#FFFFFF]"
          title="Delete user"
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
