
import { useLanguage } from "@/contexts/LanguageContext";

export interface AdminActionsProps {
  customerId: string;
  isSuperAdmin: boolean;
  isSendingEmail: boolean;
  isDeleting: boolean;
  onSendActivationEmail: () => void;
  onDeleteUser: () => void;
}

export const AdminActions = ({ 
  customerId,
  isSuperAdmin,
  isSendingEmail,
  isDeleting,
  onSendActivationEmail,
  onDeleteUser
}: AdminActionsProps) => {
  const { t } = useLanguage();

  if (!isSuperAdmin) return null;
  
  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={onSendActivationEmail}
        disabled={isSendingEmail}
        className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:bg-blue-300"
      >
        {isSendingEmail ? t('sending') : t('resend.email')}
      </button>
      <button
        onClick={onDeleteUser}
        disabled={isDeleting}
        className="text-xs bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 disabled:bg-red-300"
      >
        {isDeleting ? t('deleting') : t('delete.user')}
      </button>
    </div>
  );
};
