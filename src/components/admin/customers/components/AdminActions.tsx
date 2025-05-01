
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Trash2 } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { CustomerWithProfile } from "@/types/customer";

interface AdminActionsProps {
  customerId: string;
  customer?: CustomerWithProfile;
  isSuperAdmin?: boolean;
  isSendingEmail?: boolean;
  isUpdating?: boolean;
  isDeleting?: boolean;
  additionalUrls?: string;
  onSendActivationEmail?: () => void;
  onUpdateUrlLimits?: () => void;
  onDeleteUser?: () => void;
  setAdditionalUrls?: (urls: string) => void;
}

export const AdminActions = ({
  customerId,
  customer,
  isSuperAdmin = false,
  isSendingEmail = false,
  isUpdating = false,
  isDeleting = false,
  additionalUrls = "",
  onSendActivationEmail = () => {},
  onUpdateUrlLimits = () => {},
  onDeleteUser = () => {},
  setAdditionalUrls = () => {}
}: AdminActionsProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { t } = useLanguage();

  if (!isSuperAdmin) return null;

  return (
    <>
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-medium text-[#000000] dark:text-[#FFFFFF] mb-3">
            {t('admin.actions')}
          </h3>
          
          <div className="flex gap-2">
            <Button
              onClick={onSendActivationEmail}
              disabled={isSendingEmail}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <Mail className="h-4 w-4 mr-2" />
              {isSendingEmail ? t('sending') : t('resend.email')}
            </Button>
            
            <Button
              onClick={onDeleteUser}
              variant="outline"
              size="sm"
              className="flex-1 text-destructive hover:bg-destructive/10"
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? t('deleting') : t('delete.user')}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
