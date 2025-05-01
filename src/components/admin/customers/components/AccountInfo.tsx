
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/use-toast";
import { CustomerWithProfile } from "@/types/customer";

interface AccountInfoProps {
  customer: CustomerWithProfile;
  isOnline: boolean;
  userLastSeen: string | null;
  onCopy: (text: string, label: string) => void;
}

export const AccountInfo = ({ customer, isOnline, userLastSeen, onCopy }: AccountInfoProps) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-xs font-medium text-[#000000] dark:text-[#FFFFFFA6]">{t('customer.id')}</p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#000000] dark:text-[#FFFFFF]">{customer.id}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => onCopy(customer.id, t('customer.id'))}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="space-y-1">
        <p className="text-xs font-medium text-[#000000] dark:text-[#FFFFFFA6]">{t('created')}</p>
        <span className="text-xs text-[#000000] dark:text-[#FFFFFF]">
          {customer.created_at ? format(new Date(customer.created_at), 'PPP') : t('not.available')}
        </span>
      </div>
      
      <div className="space-y-1">
        <p className="text-xs font-medium text-[#000000] dark:text-[#FFFFFFA6]">{t('status')}</p>
        <span className="text-xs text-[#000000] dark:text-[#FFFFFF]">
          {isOnline ? t('online') : t('offline')}
        </span>
      </div>
      
      {!isOnline && userLastSeen && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-[#000000] dark:text-[#FFFFFFA6]">{t('last.seen')}</p>
          <span className="text-xs text-[#000000] dark:text-[#FFFFFF]">
            {formatDistanceToNow(new Date(userLastSeen), { addSuffix: true })}
          </span>
        </div>
      )}
    </div>
  );
};
