import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAddressSync } from '../hooks/useAddressSync';

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

interface AdminActionButtonsProps {
  isSendingEmail: boolean;
  onSendActivationEmail: () => void;
  setShowDeleteDialog: (show: boolean) => void;
}

export const AdminActionButtons = ({
  isSendingEmail,
  onSendActivationEmail,
  setShowDeleteDialog
}: AdminActionButtonsProps) => {
  return (
    <div className="absolute top-4 right-4 flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onSendActivationEmail}
        disabled={isSendingEmail}
        className="h-8 text-xs"
      >
        {isSendingEmail ? "Sending..." : "Resend Activation Email"}
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => setShowDeleteDialog(true)}
        className="h-8 text-xs"
      >
        Delete User
      </Button>
    </div>
  );
};

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
  const { isSyncing, syncAddressForCustomer } = useAddressSync();
  
  return (
    <div className="space-y-4">
      <h4 className="text-xs font-medium text-[#000000] dark:text-[#FFFFFF]">Admin Actions</h4>
      
      <div className="space-y-2">
        {/* URL Limits controls */}
        <div className="flex gap-2 items-center">
          <Label htmlFor="additional-urls" className="text-xs text-[#000000] dark:text-[#FFFFFFA6]">
            Additional URLs
          </Label>
          <Input
            id="additional-urls"
            type="number"
            value={additionalUrls}
            onChange={(e) => setAdditionalUrls(e.target.value)}
            className="max-w-[5rem] h-8 px-2 text-xs"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={onUpdateUrlLimits}
            disabled={isUpdating}
            className="h-8 text-xs"
          >
            {isUpdating ? "Updating..." : "Update"}
          </Button>
        </div>

        {/* Sync Address Button */}
        <div className="flex gap-2 items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => syncAddressForCustomer(customerId)}
            disabled={isSyncing}
            className="h-8 text-xs"
          >
            {isSyncing ? "Syncing..." : "Sync Address to Profile"}
          </Button>
        </div>
        
        {/* Email activation button */}
        {isSuperAdmin && (
          <Button
            variant="outline" 
            size="sm"
            onClick={onSendActivationEmail}
            disabled={isSendingEmail}
            className="w-full h-8 text-xs"
          >
            {isSendingEmail ? "Sending..." : "Resend Activation Email"}
          </Button>
        )}
        
        {/* Delete user button */}
        {isSuperAdmin && (
          <Button
            variant="destructive" 
            size="sm"
            onClick={onDeleteUser}
            disabled={isDeleting}
            className="w-full h-8 text-xs"
          >
            {isDeleting ? "Deleting..." : "Delete User"}
          </Button>
        )}
      </div>
    </div>
  );
};
