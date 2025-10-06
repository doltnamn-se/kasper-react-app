import { Badge } from "@/components/ui/badge";

interface AddressAlertsVisualProps {
  language: string;
}

export const AddressAlertsVisual = ({ language }: AddressAlertsVisualProps) => {
  return (
    <div className="w-full bg-white dark:bg-[#1c1c1e] p-4 md:p-6 rounded-2xl shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200 space-y-6">
      {/* Address Card */}
      <div className="bg-[#f9fafb] dark:bg-[#232325] rounded-lg p-4 border border-[#e5e7eb] dark:border-[#2e2e30]">
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <p className="text-[#111827] dark:text-white text-base font-bold">
              {language === 'sv' ? 'Storgatan 12' : 'Main Street 12'}
            </p>
            <Badge 
              variant="secondary" 
              className="text-[#097c4f] dark:text-[#85e0ba] bg-[#3fcf8e1a] dark:bg-[#3ecf8e1a] border border-[#16b674] dark:border-[#006239]"
            >
              {language === 'sv' ? 'Aktiv' : 'Active'}
            </Badge>
          </div>
          <p className="text-[#000000] dark:text-[#FFFFFF] text-sm">
            {language === 'sv' ? '123 45 Stockholm' : '123 45 Stockholm'}
          </p>
        </div>
        <div className="pt-3 border-t border-[#e5e7eb] dark:border-[#2e2e30]">
          <p className="text-[#000000] dark:text-[#FFFFFF] text-sm">
            {language === 'sv' 
              ? 'Adresslarm aktivt sedan 1 oktober 2025'
              : 'Address alert active since October 1, 2025'
            }
          </p>
        </div>
      </div>
    </div>
  );
};
