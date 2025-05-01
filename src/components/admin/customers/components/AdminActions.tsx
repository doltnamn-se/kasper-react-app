
import { Button } from "@/components/ui/button";
import { Send, Trash, RefreshCw, Ban } from "lucide-react";
import { useState } from "react";
import { AdminUrlSubmission } from "./AdminUrlSubmission";
import { DeleteUserDialog } from "./DeleteUserDialog";
import { useLanguage } from "@/contexts/LanguageContext";

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
  onBanUser
}: {
  isSendingEmail: boolean;
  onSendActivationEmail: () => void;
  setShowDeleteDialog: (show: boolean) => void;
  onRefreshData?: () => void;
  isRefreshing?: boolean;
  onBanUser?: () => void;
}) => {
  return (
    <div className="absolute right-6 top-8 md:top-6 flex gap-2">
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
          variant="outline"
          size="icon"
          title="Ban user"
          className="hover:bg-transparent text-[#000000A6] hover:text-[#000000] dark:text-[#FFFFFFA6] dark:hover:text-[#FFFFFF]"
        >
          <Ban className="h-4 w-4" />
        </Button>
      )}
      
      <Button
        onClick={() => setShowDeleteDialog(true)}
        variant="outline"
        size="icon"
        className="hover:bg-transparent text-[#000000A6] hover:text-[#000000] dark:text-[#FFFFFFA6] dark:hover:text-[#FFFFFF]"
        title="Delete user"
      >
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  );
};
