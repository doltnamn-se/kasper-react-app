
import { CustomerWithProfile } from "@/types/customer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Copy } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

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
        <p className="text-xs font-medium text-[#000000] dark:text-[#FFFFFF]">
          {t('account.details')}
        </p>

        {/* Customer Type - Moved up */}
        <div className="flex flex-row items-center gap-1">
          <span className="text-xs text-[#000000A6] dark:text-[#FFFFFFA6]">
            {t('customer.type')}:
          </span>
          <span className="text-xs text-[#000000] dark:text-white capitalize">
            {customer.customer_type}
          </span>
        </div>
        
        {/* Customer ID - Moved down */}
        <div className="flex flex-row items-center gap-1">
          <span className="text-xs text-[#000000A6] dark:text-[#FFFFFFA6]">
            {t('customer.id')}:
          </span>
          <span 
            className="text-xs text-[#000000] dark:text-white cursor-pointer underline underline-offset-2"
            onClick={() => onCopy(customer.id, t('customer.id'))}
          >
            {customer.id.slice(0, 8)}...
            <Copy className="inline ml-1 h-3 w-3" />
          </span>
        </div>
        
        <div className="flex flex-row items-center gap-1">
          <span className="text-xs text-[#000000A6] dark:text-[#FFFFFFA6]">
            {t('created')}:
          </span>
          <span className="text-xs text-[#000000] dark:text-white">
            {customer.created_at ? format(new Date(customer.created_at), 'yyyy-MM-dd') : 'N/A'}
          </span>
        </div>

        <div className="flex flex-row items-center gap-1">
          <span className="text-xs text-[#000000A6] dark:text-[#FFFFFFA6]">
            {t('status')}:
          </span>
          {isOnline ? (
            <Badge variant="outline" className="text-[10px] py-0 border-green-500 text-green-600 dark:text-green-400">
              {t('online')}
            </Badge>
          ) : (
            <div className="flex flex-col">
              <Badge variant="outline" className="text-[10px] py-0 border-gray-400 text-gray-500">
                {t('offline')}
              </Badge>
              {userLastSeen && (
                <span className="text-[10px] text-[#000000A6] dark:text-[#FFFFFFA6] mt-1">
                  {t('last.seen')} {userLastSeen}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
