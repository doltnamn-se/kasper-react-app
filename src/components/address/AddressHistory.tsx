import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";
import { sv, enUS } from "date-fns/locale";

type AddressHistoryEntry = {
  street_address: string;
  postal_code: string;
  city: string;
  created_at: string;
  deleted_at: string;
};

interface AddressHistoryProps {
  history: AddressHistoryEntry[];
}

export const AddressHistory = ({ history }: AddressHistoryProps) => {
  const { language } = useLanguage();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'PP', { locale: language === 'sv' ? sv : enUS });
  };

  return (
    <div className="mt-8">
      <h3 className="text-lg font-medium mb-4 dark:text-white">
        {language === 'sv' ? 'Tidigare adresser' : 'Previous addresses'}
      </h3>
      <div className="space-y-4">
        {history.map((historyEntry, index) => (
          <div 
            key={index}
            className="bg-[#f9fafb] dark:bg-[#232325] rounded-lg p-4 border border-[#e5e7eb] dark:border-[#2e2e30] opacity-75"
          >
            <div className="space-y-2 mb-4">
              <p className="text-[#111827] dark:text-white text-base font-medium">
                {historyEntry.street_address}
              </p>
              <p className="text-[#4b5563] dark:text-[#a1a1aa] text-sm">
                {historyEntry.postal_code} {historyEntry.city}
              </p>
            </div>
            <div className="pt-3 border-t border-[#e5e7eb] dark:border-[#2e2e30]">
              <p className="text-[#4b5563] dark:text-[#a1a1aa] text-sm">
                {language === 'sv'
                  ? `Aktiv ${formatDate(historyEntry.created_at)} - ${formatDate(historyEntry.deleted_at)}`
                  : `Active ${formatDate(historyEntry.created_at)} - ${formatDate(historyEntry.deleted_at)}`
                }
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};