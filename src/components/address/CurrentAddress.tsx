import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";
import { sv, enUS } from "date-fns/locale";

interface CurrentAddressProps {
  addressData: {
    street_address: string;
    postal_code: string;
    city: string;
    created_at: string;
  };
  onDelete: () => void;
}

export const CurrentAddress = ({ addressData, onDelete }: CurrentAddressProps) => {
  const { language } = useLanguage();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'PP', { locale: language === 'sv' ? sv : enUS });
  };

  return (
    <div className="bg-[#f9fafb] dark:bg-[#232325] rounded-lg p-4 border border-[#e5e7eb] dark:border-[#2e2e30] relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
        onClick={onDelete}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      <div className="space-y-2 mb-4">
        <p className="text-[#111827] dark:text-white text-base font-medium">
          {addressData.street_address}
        </p>
        <p className="text-[#4b5563] dark:text-[#a1a1aa] text-sm">
          {addressData.postal_code} {addressData.city}
        </p>
      </div>
      <div className="pt-3 border-t border-[#e5e7eb] dark:border-[#2e2e30]">
        <p className="text-[#4b5563] dark:text-[#a1a1aa] text-sm">
          {language === 'sv' 
            ? `Adresslarm aktivt sedan ${formatDate(addressData.created_at)}`
            : `Address alert active since ${formatDate(addressData.created_at)}`
          }
        </p>
      </div>
    </div>
  );
};