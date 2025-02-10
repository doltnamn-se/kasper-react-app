
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
    <div>
      <h3 className="text-base font-medium text-[#000000] dark:text-[#FFFFFFA6] mb-3">
        {t('account.details')}
      </h3>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-[#000000] dark:text-[#FFFFFFA6]">{t('customer.id')}</span>
          <div className="flex items-center gap-2">
            <span className="text-[#000000A6] dark:text-[#FFFFFFA6]">{customer.id}</span>
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
        <p className="text-xs font-medium flex justify-between">
          <span className="text-[#000000] dark:text-[#FFFFFFA6]">{t('created')}</span>
          <span className="text-[#000000A6] dark:text-[#FFFFFFA6]">
            {customer.created_at ? format(new Date(customer.created_at), 'PPP') : t('not.available')}
          </span>
        </p>
        <p className="text-xs font-medium flex justify-between">
          <span className="text-[#000000] dark:text-[#FFFFFFA6]">{t('status')}</span>
          <span className="text-[#000000A6] dark:text-[#FFFFFFA6]">
            {isOnline ? t('online') : t('offline')}
          </span>
        </p>
        {!isOnline && userLastSeen && (
          <p className="text-xs font-medium flex justify-between">
            <span className="text-[#000000] dark:text-[#FFFFFFA6]">{t('last.seen')}</span>
            <span className="text-[#000000A6] dark:text-[#FFFFFFA6]">
              {formatDistanceToNow(new Date(userLastSeen), { addSuffix: true })}
            </span>
          </p>
        )}
      </div>
    </div>
  );
};
