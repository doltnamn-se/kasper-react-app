
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Trash2 } from "lucide-react";
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
  onUpdateUrlLimits: (urls: string) => void;
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
      <div className="space-y-2">
        <Button
          onClick={onSendActivationEmail}
          disabled={isSendingEmail}
          variant="outline"
          className="w-full"
        >
          <Mail className="h-4 w-4 mr-2" />
          {isSendingEmail ? "Sending..." : "Resend Activation Email"}
        </Button>
        
        <Button
          onClick={() => setShowDeleteDialog(true)}
          variant="destructive"
          className="w-full"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete User
        </Button>
      </div>

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
            onClick={() => onUpdateUrlLimits(additionalUrls)}
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
