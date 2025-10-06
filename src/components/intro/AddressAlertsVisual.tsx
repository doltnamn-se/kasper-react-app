import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";

interface AddressAlertsVisualProps {
  language: string;
}

export const AddressAlertsVisual = ({ language }: AddressAlertsVisualProps) => {
  return (
    <div className="w-full bg-white dark:bg-[#1c1c1e] p-4 md:p-6 rounded-2xl shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200 space-y-6">
      {/* Address Card */}
      <div className="bg-[#f9fafb] dark:bg-[#232325] rounded-lg p-4 border border-[#e5e7eb] dark:border-[#2e2e30]">
        <div className="space-y-1 mb-4">
          <div className="flex items-center justify-between">
            <p className="text-[#111827] dark:text-white text-base font-bold">
              {language === 'sv' ? 'Storgatan 12' : '207 E 57th St'}
            </p>
            <div className="flex items-center gap-2">
              <Spinner 
                color="#20f922" 
                size={16} 
                centerSize={5}
              />
              <span className="text-xs md:text-sm">
                {language === 'sv' ? 'Aktiv' : 'Active'}
              </span>
            </div>
          </div>
          {language === 'sv' ? (
            <>
              <p className="text-[#000000] dark:text-[#FFFFFF] text-sm">
                114 51 Stockholm
              </p>
              <p className="text-[#000000] dark:text-[#FFFFFF] text-sm">
                Sverige
              </p>
            </>
          ) : (
            <>
              <p className="text-[#000000] dark:text-[#FFFFFF] text-sm">
                New York
              </p>
              <p className="text-[#000000] dark:text-[#FFFFFF] text-sm">
                NY 10022
              </p>
            </>
          )}
        </div>
        <div className="pt-3 border-t border-[#e5e7eb] dark:border-[#2e2e30]">
          <p className="text-[#000000] dark:text-[#FFFFFF] text-sm">
            {language === 'sv' 
              ? 'Aktivt sedan 1 oktober 2025'
              : 'Active since October 1, 2025'
            }
          </p>
        </div>
      </div>
    </div>
  );
};
