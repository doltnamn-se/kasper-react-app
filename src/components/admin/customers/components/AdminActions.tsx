
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Trash, RefreshCw } from "lucide-react";
import { useState } from "react";
import { AdminUrlSubmission } from "./AdminUrlSubmission";
import { DeleteUserDialog } from "./DeleteUserDialog";

interface AdminActionsProps {
  customerId: string;
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

export const AdminActions = ({
  customerId,
  isSuperAdmin,
  isSendingEmail,
  isUpdating,
  isDeleting,
  additionalUrls,
  onSendActivationEmail,
  onUpdateUrlLimits,
  onDeleteUser,
  setAdditionalUrls
}: AdminActionsProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  if (!isSuperAdmin) return null;

  return (
    <>
      <div>
        <h3 className="text-base font-medium text-[#000000] dark:text-[#FFFFFFA6] mb-3">
          URL Limits
        </h3>
        <div className="flex gap-2 items-center">
          <Input
            type="number"
            value={additionalUrls}
            onChange={(e) => setAdditionalUrls(e.target.value)}
            className="w-24"
            min="0"
          />
          <Button 
            onClick={onUpdateUrlLimits}
            disabled={isUpdating}
            size="sm"
          >
            {isUpdating ? "Updating..." : "Update"}
          </Button>
        </div>
      </div>
      
      <AdminUrlSubmission customerId={customerId} />

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
  isRefreshing = false
}: {
  isSendingEmail: boolean;
  onSendActivationEmail: () => void;
  setShowDeleteDialog: (show: boolean) => void;
  onRefreshData?: () => void;
  isRefreshing?: boolean;
}) => {
  return (
    <div className="absolute right-6 top-6 flex gap-2">
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
