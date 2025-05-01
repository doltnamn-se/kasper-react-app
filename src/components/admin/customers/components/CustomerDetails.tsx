import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { CustomerWithProfile } from "@/types/customer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/use-toast";
import { useCustomerAddress } from "../hooks/useCustomerAddress";

interface CustomerDetailsProps {
  customer: CustomerWithProfile;
}

export const CustomerDetails = ({ customer }: CustomerDetailsProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { data: address, isLoading } = useCustomerAddress(customer.id);

  // Enhanced logging for debugging
  console.log("CustomerDetails: Raw customer object =", customer);
  console.log("CustomerDetails: Address from direct query =", address);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: t('toast.copied.title'),
      description: `${label} ${t('toast.copied.description')}`
    });
  };

  // Simple display of address - if we have address data from our direct query, use that
  // otherwise fallback to the message
  const displayAddress = address || t('no.address');
  console.log("CustomerDetails: Final display address =", displayAddress);

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-xs font-medium text-[#000000] dark:text-[#FFFFFF]">
          {t('name')}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#000000] dark:text-[#FFFFFF]">
            {customer.profile?.display_name || t('no.name')}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => handleCopy(customer.profile?.display_name || '', t('name'))}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="space-y-1">
        <p className="text-xs font-medium text-[#000000] dark:text-[#FFFFFF]">
          {t('email')}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#000000] dark:text-[#FFFFFF]">
            {customer.profile?.email || t('no.email')}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => handleCopy(customer.profile?.email || '', t('email'))}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-xs font-medium text-[#000000] dark:text-[#FFFFFF]">
          {t('address')}
        </p>
        {isLoading ? (
          <div className="h-5 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#000000] dark:text-[#FFFFFF]">
              {displayAddress}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => handleCopy(displayAddress !== t('no.address') ? displayAddress : '', t('address'))}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
